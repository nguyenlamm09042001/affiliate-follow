// src/components/BankQRModal.tsx
import React from "react";

type Props = {
  open: boolean;
  orderId: string;
  amountVnd: number;                // 👈 dùng amountVnd như bạn đang truyền
  onClose: () => void;
  onConfirmed: () => void;
};

const BANK_BIN = process.env.NEXT_PUBLIC_BANK_BIN || "";
const BANK_ACC = process.env.NEXT_PUBLIC_BANK_ACCOUNT || "";
const BANK_ACC_NAME = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "";
const BANK_NAME = process.env.NEXT_PUBLIC_BANK_NAME || "";

export default function BankQRModal({
  open,
  orderId,
  amountVnd,
  onClose,
  onConfirmed,
}: Props) {
  if (!open) return null;

  // Ghi nội dung chuyển khoản: ORDER <id>
  const addInfo = `ORDER ${orderId}`;
  // Dùng VietQR để render QR động (không cần ảnh tĩnh)
  const qrUrl = BANK_BIN && BANK_ACC
    ? `https://img.vietqr.io/image/${BANK_BIN}-${BANK_ACC}-compact2.png?amount=${amountVnd}&addInfo=${encodeURIComponent(addInfo)}`
    : "";

  const copyNote = async () => {
    try {
      await navigator.clipboard.writeText(addInfo);
      alert("Đã copy nội dung chuyển khoản.");
    } catch {
      alert("Không copy được. Bạn vui lòng copy thủ công.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-black/5 dark:border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">Chuyển khoản ngân hàng</h3>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Đóng
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="text-sm text-slate-700 dark:text-slate-300">
            Vui lòng quét mã để thanh toán <span className="font-semibold">{amountVnd.toLocaleString()} đ</span>.
            Nội dung chuyển khoản <span className="font-mono font-semibold">{addInfo}</span> (nhớ ghi đúng để tự động khớp lệnh).
          </div>

          {qrUrl ? (
            <div className="flex flex-col items-center gap-2">
              <img src={qrUrl} alt="QR chuyển khoản" className="rounded-lg w-[260px] h-auto border border-black/5 dark:border-white/10" />
              <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
  Ngân hàng: <b>{BANK_NAME || BANK_BIN}</b> • 
  Số TK: <b>{BANK_ACC}</b> • 
  Tên: <b>{BANK_ACC_NAME || "—"}</b>
</div>


            </div>
          ) : (
            <div className="rounded-lg bg-red-50 text-red-700 p-3 text-sm">
              Thiếu cấu hình ngân hàng. Hãy set các biến môi trường:
              <div className="mt-1 font-mono text-xs">
                NEXT_PUBLIC_BANK_BIN, NEXT_PUBLIC_BANK_ACCOUNT, NEXT_PUBLIC_BANK_NAME
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={copyNote}
              className="rounded-xl py-2.5 font-semibold bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white"
            >
              Copy nội dung
            </button>
            <button
              onClick={onConfirmed}
              className="rounded-xl py-2.5 font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90"
            >
              Tôi đã chuyển khoản
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
