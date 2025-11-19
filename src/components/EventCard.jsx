import React from "react";
import styles from "../css/eventCard.module.css";

const EventCard = ({ event }) => {
  return (
    <div
      className={styles.card}
      style={{ background: event.color }}
    >
      <h4>{event.title}</h4>
      <span className={styles.type}>{event.type}</span>
      <div className={styles.time}>{event.time}</div>
    </div>
  );
};

export default EventCard;
