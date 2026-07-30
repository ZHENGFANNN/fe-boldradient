import styles from "./index.module.scss";

import BottomModule from "./BottomModule";
import ContactModule from "./ContactModule";
import NavModule from "./NavModule";
import PolicyModule from "./PolicyModule";

export default function Footer() {
  return (
    <footer className={styles.container} data-role="footer-info">
      <NavModule />
      <ContactModule />
      <PolicyModule />
      <BottomModule />
    </footer>
  );
}
