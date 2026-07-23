import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Poll, PollOption } from "../../types";
import { Vote, Plus, Trash2, CheckCircle2, Users } from "lucide-react";

interface PollsWidgetProps {
  allowCreate?: boolean;
}

export const PollsWidget: React.FC<PollsWidgetProps> = ({ allowCreate = true }) => {
  const { userProfile } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Poll Form
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [targetAudience, setTargetAudience] = useState<
    "All" | "Students" | "Faculty" | "CSE" | "ECE" | "ME" | "CV"
  >("All");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "polls"), (snap) => {
      const list: Poll[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Poll));
      setPolls(list);
    });
    return () => unsub();
  }, []);

  const userId = userProfile?.uid || "guest_user";

  const handleVote = async (poll: Poll, optionId: string) => {
    const hasVoted = poll.votedUserIds?.includes(userId);
    let newTotalVotes = poll.totalVotes || 0;
    const updatedUserIds = [...(poll.votedUserIds || [])];

    if (!hasVoted) {
      newTotalVotes += 1;
      updatedUserIds.push(userId);
    }

    const updatedOptions: PollOption[] = poll.options.map((opt) => {
      const userAlreadyVotedThisOpt = opt.votedUserIds?.includes(userId);
      let optVotes = opt.votes || 0;
      const optUserIds = [...(opt.votedUserIds || [])];

      if (opt.id === optionId) {
        if (!userAlreadyVotedThisOpt) {
          optVotes += 1;
          optUserIds.push(userId);
        }
      } else {
        if (userAlreadyVotedThisOpt) {
          optVotes = Math.max(0, optVotes - 1);
          const idx = optUserIds.indexOf(userId);
          if (idx > -1) optUserIds.splice(idx, 1);
        }
      }

      return {
        ...opt,
        votes: optVotes,
        votedUserIds: optUserIds,
      };
    });

    await setDoc(doc(db, "polls", poll.id), {
      ...poll,
      totalVotes: newTotalVotes,
      votedUserIds: updatedUserIds,
      options: updatedOptions,
    });
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.filter((o) => o.trim() !== "");
    if (!question.trim() || validOptions.length < 2) {
      alert("Please enter a question and at least 2 valid poll choices.");
      return;
    }

    const pollOpts: PollOption[] = validOptions.map((optText, index) => ({
      id: `opt_${index + 1}_${Date.now()}`,
      text: optText,
      votes: 0,
      votedUserIds: [],
    }));

    await addDoc(collection(db, "polls"), {
      question,
      options: pollOpts,
      targetAudience,
      createdBy: userProfile?.name || "College Admin",
      createdAt: new Date().toISOString(),
      totalVotes: 0,
      votedUserIds: [],
    });

    setQuestion("");
    setOptions(["", ""]);
    setShowCreateModal(false);
  };

  const handleDeletePoll = async (id: string) => {
    if (confirm("Are you sure you want to delete this poll?")) {
      await deleteDoc(doc(db, "polls", id));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
        <div className="flex items-center space-x-2">
          <Vote className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
            Campus Opinion Polls & Surveys
          </h3>
        </div>

        {allowCreate && (
          <button
            onClick={() => setShowCreateModal(!showCreateModal)}
            className="px-3 py-1.5 rounded-xl bg-[#002147] text-[#D4AF37] hover:bg-[#001530] text-xs font-bold shadow flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Poll</span>
          </button>
        )}
      </div>

      {/* Create Poll Form */}
      {showCreateModal && (
        <form
          onSubmit={handleCreatePoll}
          className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3 animate-in fade-in"
        >
          <h4 className="text-xs font-bold text-gray-900 dark:text-white">New Campus Poll</h4>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Poll Question
            </label>
            <input
              type="text"
              placeholder="e.g. Should the college library extend evening hours during VTU exams?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-gray-500">
              Poll Choices (At least 2)
            </label>
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...options];
                    newOpts[idx] = e.target.value;
                    setOptions(newOpts);
                  }}
                  className="flex-1 p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setOptions([...options, ""])}
              className="text-xs font-bold text-[#002147] dark:text-amber-400 hover:underline flex items-center gap-1 mt-1"
            >
              <Plus className="w-3 h-3" /> Add Choice Option
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Target Audience
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as any)}
              className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="All">All College Members</option>
              <option value="Students">Students Only</option>
              <option value="Faculty">Faculty Only</option>
              <option value="CSE">CSE Department</option>
              <option value="ECE">ECE Department</option>
              <option value="ME">ME Department</option>
              <option value="CV">CV Department</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#002147] text-[#D4AF37] font-bold text-xs shadow"
            >
              Publish Poll
            </button>
          </div>
        </form>
      )}

      {/* Polls List */}
      <div className="space-y-4">
        {polls.length > 0 ? (
          polls.map((poll) => {
            const userVoted = poll.votedUserIds?.includes(userId);
            const totalMembersVoted = poll.totalVotes || 0;

            return (
              <div
                key={poll.id}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/60 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      {poll.question}
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Posted by <span className="font-semibold text-gray-700 dark:text-gray-300">{poll.createdBy}</span> • Audience: {poll.targetAudience}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Explicitly show number of members in poll */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#002147] text-[#D4AF37] shadow-sm">
                      <Users className="w-3.5 h-3.5" />
                      <span>{totalMembersVoted} {totalMembersVoted === 1 ? "Member Voted" : "Members Voted"}</span>
                    </span>

                    {(userProfile?.role === "admin" || userProfile?.name === poll.createdBy) && (
                      <button
                        onClick={() => handleDeletePoll(poll.id)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                        title="Delete Poll"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Options List */}
                <div className="space-y-2">
                  {poll.options.map((opt) => {
                    const optVotes = opt.votes || 0;
                    const pct = totalMembersVoted > 0 ? Math.round((optVotes / totalMembersVoted) * 100) : 0;
                    const isUserChoice = opt.votedUserIds?.includes(userId);

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleVote(poll, opt.id)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs relative overflow-hidden transition-all ${
                          isUserChoice
                            ? "border-[#002147] dark:border-amber-400 bg-blue-50/80 dark:bg-amber-950/40 font-bold"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-400 bg-white dark:bg-gray-800"
                        }`}
                      >
                        {/* Vote progress fill bar */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 opacity-20 transition-all rounded-r-xl ${
                            isUserChoice ? "bg-[#002147] dark:bg-amber-400" : "bg-gray-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        />

                        <div className="relative z-10 flex items-center justify-between">
                          <span className="flex items-center gap-2 text-gray-900 dark:text-white">
                            {isUserChoice && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400" />}
                            {opt.text}
                          </span>
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            {optVotes} {optVotes === 1 ? "member" : "members"} ({pct}%)
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
            No opinion polls active at present. Click &quot;Create Poll&quot; to start a poll for students &amp; faculty.
          </div>
        )}
      </div>
    </div>
  );
};
