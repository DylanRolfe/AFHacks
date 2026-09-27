"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
export function Dialog({
  open,
  onClose,
  title,
  children,
  drawer = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  drawer?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      if (document.documentElement.classList.contains("video-demo-running")) dialog.show();
      else dialog.showModal();
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        dialog.close();
        document.body.style.overflow = previous;
      };
    }
    dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`dialog ${drawer ? "drawer" : ""}`}
      onCancel={() => closeRef.current()}
      onClick={(e) => {
        if (e.target === ref.current) closeRef.current();
      }}
      aria-label={title}
    >
      <div className="dialog-inner">
        <div className="dialog-header">
          <span className="eyebrow">BIDNORTH WORKSPACE</span>
          <button
            className="icon-button"
            data-demo="plan-close"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </div>
        <h2>{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
