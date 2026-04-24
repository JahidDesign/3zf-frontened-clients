"use client";

import React, { useState, ChangeEvent } from "react";
import Swal from "sweetalert2";
import { Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  firebaseUid: string;
  userEmail: string | null;
  onPaymentDone: () => void;
}

const BKASH_NUMBER = "01341664882";

const SWAL_THEME = {
  background: "#0b1f12",
  color: "#eef4f0",
  confirmButtonColor: "#e8b84b",
} as const;

export default function PaymentGate({ firebaseUid, userEmail, onPaymentDone }: Props) {
  const [sender, setSender]         = useState("");
  const [trxId, setTrxId]           = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isValid = sender.length >= 11 && trxId.length >= 5;

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:5000/payment-charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid,
          userEmail,
          method: "bkash",
          senderNumber: sender,
          transactionId: trxId.trim().toUpperCase(),
          amount: 200,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Payment failed");
      }

      await Swal.fire({
        icon: "success",
        title: "Payment Recorded!",
        text: "আপনার ৳200 ফি সংরক্ষিত হয়েছে। এখন membership form পূরণ করুন।",
        ...SWAL_THEME,
      });

      localStorage.setItem("harmony_payment_done", "true");
      onPaymentDone();

    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Payment সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।",
        ...SWAL_THEME,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hms-root">
      <div
        className="hms-form-card hms-anim hms-d1"
        style={{ maxWidth: 460, margin: "2rem auto" }}
      >
        {/* Header */}
        <div
          className="hms-form-header"
          style={{ background: "#D9005C", color: "#fff", borderRadius: "10px 10px 0 0" }}
        >
          <span style={{ fontSize: 18 }}>bK</span>&nbsp; Membership Fee Payment — ৳200
        </div>

        <div style={{ padding: "1.4rem" }}>

          {/* Amount badge */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "rgba(217,0,92,0.06)", border: "0.5px solid #f4c0d1",
            borderRadius: 8, padding: "0.9rem 1.1rem", marginBottom: "1.2rem",
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>Registration fee</p>
              <p style={{ margin: 0, fontSize: 11, opacity: 0.5 }}>One-time · non-refundable</p>
            </div>
            <span style={{ fontSize: 28, fontWeight: 600, color: "#D9005C" }}>৳200</span>
          </div>

          {/* Instruction box */}
          <div style={{
            background: "#fff0f5", border: "0.5px solid #f4c0d1",
            borderRadius: 8, padding: "0.85rem 1rem", marginBottom: "1.2rem",
            fontSize: 13, color: "#72243E", lineHeight: 1.7,
          }}>
            <strong>bKash Send Money</strong> করুন এই নম্বরে:<br />
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: 1, color: "#D9005C" }}>
              {BKASH_NUMBER}
            </span>
            <br />
            Amount: <strong>৳200</strong> &nbsp;·&nbsp; Reference: আপনার নাম লিখুন<br />
            পাঠানোর পর TrxID নিচে দিন।
          </div>

          {/* Sender number */}
          <div className="hms-field" style={{ marginBottom: 14 }}>
            <label className="hms-field-label">
              আপনার bKash নম্বর (যেটা থেকে পাঠিয়েছেন)
            </label>
            <input
              type="tel"
              maxLength={11}
              placeholder="01XXXXXXXXX"
              value={sender}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSender(e.target.value)}
              className="hms-field-input"
            />
          </div>

          {/* TrxID */}
          <div className="hms-field" style={{ marginBottom: 20 }}>
            <label className="hms-field-label">Transaction ID (TrxID)</label>
            <input
              type="text"
              placeholder="e.g. 8MN3K2XYZ1"
              value={trxId}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTrxId(e.target.value)}
              className="hms-field-input"
            />
            <p style={{ fontSize: 11, opacity: 0.5, margin: "4px 0 0" }}>
              bKash app → Sent Money বিভাগে TrxID পাবেন
            </p>
          </div>

          {/* Submit button */}
          <button
            type="button"
            disabled={!isValid || submitting}
            onClick={handleSubmit}
            className="hms-submit-btn"
            style={{
              width: "100%",
              background: isValid && !submitting ? "#D9005C" : undefined,
              borderColor: "#D9005C",
            }}
          >
            {submitting ? (
              <><Loader2 size={15} className="hms-spin" /> Verifying…</>
            ) : (
              <><CheckCircle2 size={15} /> Confirm ৳200 Payment &amp; Continue</>
            )}
          </button>

          <p style={{ fontSize: 11, textAlign: "center", opacity: 0.5, marginTop: 10 }}>
            Payment confirm হলে membership form খুলবে।
          </p>
        </div>
      </div>
    </div>
  );
}