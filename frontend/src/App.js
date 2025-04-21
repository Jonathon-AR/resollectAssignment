import { useEffect, useState } from "react";
import { api } from "./utils/api";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import "./index.css";

dayjs.extend(duration);

export default function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const [now, setNow] = useState(dayjs());
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  const fetchTasks = () => {
    api
      .get("/task/")
      .then((res) => setTasks(res.data))
      .catch((err) => console.error("Fetch failed", err));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(dayjs());

      setTasks((prev) =>
        prev.map((task) => {
          if (
            task.status === "ongoing" &&
            dayjs(task.deadline).isBefore(dayjs())
          ) {
            return { ...task, status: "failure" };
          }
          return task;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleComplete = (taskId) => {
    api
      .patch(`/task/${taskId}/`, {
        status: "success",
        completed: true,
        completed_at: dayjs().toISOString(),
      })
      .then(() => {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? { ...task, status: "success" } : task
          )
        );
      })
      .catch((err) => console.error("Update failed", err));
  };

  const handleAddTask = () => {
    if (newTask.title && newTask.deadline) {
      api
        .post("/task/", {
          ...newTask,
          status: "ongoing",
        })
        .then((res) => {
          setTasks((prev) => [...prev, res.data]);
          setNewTask({ title: "", description: "", deadline: "" }); // Reset form
        })
        .catch((err) => console.error("Add task failed", err));
    }
  };

  const processedTasks = tasks.map((task) => {
    if (task.status === "ongoing" && dayjs(task.deadline).isBefore(now)) {
      return { ...task, status: "failure" };
    }
    return task;
  });

  const grouped = {
    ongoing: processedTasks.filter((t) => t.status === "ongoing"),
    success: processedTasks.filter((t) => t.status === "success"),
    failure: processedTasks.filter((t) => t.status === "failure"),
  };

  const formatCountdown = (deadline) => {
    const diff = dayjs(deadline).diff(now);
    if (diff <= 0) return "Expired";
    const dur = dayjs.duration(diff);
    const days = Math.floor(dur.asDays());
    const hours = dur.hours().toString().padStart(2, "0");
    const minutes = dur.minutes().toString().padStart(2, "0");
    const seconds = dur.seconds().toString().padStart(2, "0");
    return `${days} days ${hours}:${minutes}:${seconds} left`;
  };

  return (
    <div className="p-8 space-y-12">
      {Object.entries(grouped).map(([status, list]) => (
        <div key={status}>
          <h2 className="text-4xl font-bold capitalize mb-4">{status}</h2>
          <div className="space-y-3">
            {list.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-gray-100 rounded-xl shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{task.title}</h3>
                    <p className="text-gray-700 text-sm">{task.description}</p>
                    {status === "ongoing" && (
                      <p className="text-gray-500 text-xs mt-2">
                        {formatCountdown(task.deadline)}
                      </p>
                    )}
                  </div>
                  {status === "ongoing" && (
                    <button
                      onClick={() => handleComplete(task.id)}
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add Task Row */}
      <div className="p-4 bg-gray-100 rounded-xl shadow-sm mt-12">
        <h2 className="text-4xl font-bold mb-4">Add New Task</h2>
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            value={newTask.title}
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Task Title"
            className="p-3 border rounded-lg"
          />
          <textarea
            value={newTask.description}
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Task Description"
            className="p-3 border rounded-lg"
            rows={3}
          />
          <input
            type="datetime-local"
            value={newTask.deadline}
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, deadline: e.target.value }))
            }
            className="p-3 border rounded-lg"
          />
          <button
            onClick={handleAddTask}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm transition-colors"
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}
