"use client";
import "./founder.css";

const ArrowRight = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

export default function FounderAbout() {
  return (
    <>
      <div className="ea-root">
        <section className="ea-section">
          <div className="ea-wrap">
            <div className="ea-founder">
              <img src="/team/ceo.png" alt="Founder" className="ea-avatar" />
              <div className="ea-founder-name">Founder&apos;s Message</div>
              <div className="ea-founder-quote">
                 প্রকৃত স্বাধীনতা তখনই প্রতিষ্ঠিত হয়, যখন সমাজ হয় সুদমুক্ত, শোষণমুক্ত এবং অজ্ঞতামুক্ত। এই বিশ্বাস ও উপলব্ধি থেকেই Three Zeros of Freedom (3ZF) ধারণার সূচনা। <br/>
               3ZF এমন একটি সমাজের স্বপ্ন দেখে, যেখানে অর্থনীতি হবে ন্যায়ভিত্তিক, মানুষ হবে মর্যাদাপূর্ণ জীবনের অধিকারী, এবং জ্ঞান হবে উন্নতির প্রধান শক্তি। আমার বিশ্বাস, যে সমাজে এই তিনটি শূন্য বাস্তবায়িত হবে, সেই সমাজের মানুষই সত্যিকার অর্থে স্বাধীনভাবে ও মর্যাদার সাথে বাঁচতে পারবে। <br/>
              এই লক্ষ্য বাস্তবায়নের জন্য 3ZF শুধু একটি ধারণা নয়, বরং একটি সচেতন সামাজিক উদ্যোগ—যার উদ্দেশ্য একটি ন্যায্য, মানবিক ও জ্ঞানসমৃদ্ধ সমাজ গড়ে তোলা।
                <span className="ea-founder-sig">— Md. Asaduzzaman Sujon</span>
              </div>
              <div className="ea-founder-tag">
                হারমনি উদ্যোক্তা এসোসিয়েশন — একটি পরিবর্তন ও ন্যায়ের।
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER CTA ── */}
        <footer className="ea-footer">
          <div className="ea-footer-inner">
            <div className="ea-head-label" style={{ justifyContent: 'center', marginBottom: 18 }}>
              Join Today
            </div>
            <h2>আপনি কি সত্যিই আপনার জীবন পরিবর্তন করতে চান?</h2>
            <p className="ea-footer-sub">আজই যুক্ত হোন আমাদের হারমনি পরিবারের সাথে।</p>
            <button className="ea-btn-primary" style={{ fontSize: 'clamp(0.82rem, 1.8vw, 0.95rem)', padding: 'clamp(12px, 2vw, 15px) clamp(22px, 5vw, 36px)' }}>
              Join Harmony Entrepreneur Association <ArrowRight size={18} />
            </button>
          </div>
        </footer>

      </div>
    </>
  );
}