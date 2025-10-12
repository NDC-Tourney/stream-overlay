import { motion } from "motion/react";
import { useTosu } from "~/state/tosu";

export function Chat() {
  const { tourney } = useTosu();

  return (
    <div id="chat">
      {tourney.chat
        .filter((msg: any) => msg.team !== "bot")
        .map((msg: any, idx: number) => (
          <motion.div
            className="chat-message"
            key={msg.id ?? idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            layout
          >
            <div
              className="chat-username"
              style={{
                color:
                  msg.team === "left"
                    ? "#FD515C"
                    : msg.team === "right"
                      ? "#5583F9"
                      : "#FF962D",
              }}
            >
              {msg.name}:
            </div>
            <div className="chat-text">{msg.message}</div>
          </motion.div>
        ))}
    </div>
  );
}
