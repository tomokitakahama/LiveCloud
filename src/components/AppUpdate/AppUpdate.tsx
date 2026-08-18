import { useRegisterSW } from "virtual:pwa-register/react";

import "./AppUpdate.css";

export default function AppUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_, registration) {
      if (!registration) return;
      window.setInterval(() => {
        void registration.update();
      }, 60 * 60 * 1000);
    },
  });

  if (!needRefresh) return null;

  return (
    <aside className="appUpdate" role="status">
      <p>新しいバージョンを利用できます。</p>
      <div>
        <button type="button" onClick={() => void updateServiceWorker(true)}>
          更新する
        </button>
        <button type="button" className="appUpdateDismiss" onClick={() => setNeedRefresh(false)}>
          後で
        </button>
      </div>
    </aside>
  );
}
