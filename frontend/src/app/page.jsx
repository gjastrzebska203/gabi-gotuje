import Image from "next/image";
import styles from "./page.module.css";
import Navigation from "./components/Navigation";

export default function HomePage() {
  return (
    <div className="page">
      <Navigation></Navigation>
      <h3>Gabi gotuje</h3>
    </div>
  );
}
