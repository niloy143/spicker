import styles from "./style.module.css";

export default function Spinner() {
  return (
    <div className={styles.spinner}>
      <div className={styles["spinner-circle"]}></div>
    </div>
  );
}
