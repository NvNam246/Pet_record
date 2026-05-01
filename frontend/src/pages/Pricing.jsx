// PetAware Payment Flow Demo — v1.1 (Đã Fix Lỗi & Tối Ưu Enterprise)
import React, { useState, useRef, useEffect } from "react";
import {
  Check,
  X,
  Sparkles,
  ArrowLeft,
  Shield,
  CreditCard,
  Smartphone,
  Lock,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Pricing = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("petUser") || "{}");
  const currentPlan = currentUser.plan || "Free";
  const isLoggedIn = !!localStorage.getItem("petToken");

  // --- WIZARD STATES ---
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState(null);

  // Form states
  const [agreeTos, setAgreeTos] = useState(false);
  const [payMethod, setPayMethod] = useState("card");
  const [card, setCard] = useState({
    number: "",
    exp: "",
    cvv: "",
    name: "",
    save: true,
  });
  const [auth, setAuth] = useState({ useOtp: false, password: "", otp: "" });
  const [failReason, setFailReason] = useState("");

  const confirmationRef = useRef(null);

  useEffect(() => {
    confirmationRef.current = Math.floor(10000000 + Math.random() * 90000000);
  }, []);

  // --- DATA ---
  const tiers = [
    {
      name: "Free",
      price: 0,
      desc: "Perfect for single pet owners starting out.",
      features: [
        "1 Pet Profile",
        "Basic Health Tracking",
        "50MB Image Storage",
        "Community Support",
      ],
      btnText: "Current Plan",
      popular: false,
    },
    {
      name: "Premium",
      price: 9,
      desc: "Great for multi-pet families needing more storage.",
      features: [
        "Up to 3 Pet Profiles",
        "Advanced Reminders",
        "5GB Image Storage",
        "Priority Email Support",
        "Export Records (PDF)",
      ],
      btnText: "Choose Premium",
      popular: false,
    },
    {
      name: "Professional",
      price: 19,
      desc: "For dedicated pet parents and breeders.",
      features: [
        "Unlimited Pets",
        "AI Health Insights",
        "Unlimited Storage",
        "24/7 Telehealth Chat",
      ],
      btnText: "Choose Pro",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "For veterinary clinics and shelters.",
      features: [
        "Clinic Dashboard",
        "White-label Option",
        "EHR Integration",
        "Dedicated Account Manager",
      ],
      btnText: "Contact Sales",
      popular: false,
    },
  ];

  // --- HANDLERS ---
  const handleSelectPlan = (tier) => {
    if (!isLoggedIn) {
      toast.error("Please log in to subscribe.");
      return navigate("/auth");
    }

    // 👉 FIX: Chức năng chốt sale cho gói Enterprise (Mở ứng dụng Email)
    if (tier.name === "Enterprise") {
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = `mailto:admin@petaware.com?subject=Enterprise%20Plan%20Inquiry%20from%20${currentUser.name || "Client"}`;
      return toast.success("Opening your email client...", { icon: "📧" });
    }

    if (tier.name === currentPlan || tier.name === "Free") {
      return toast("Already on this plan", { icon: "ℹ️" });
    }

    setSelectedTier(tier);
    setStep(2); // Go to Compare
    window.scrollTo(0, 0);
  };

  const handleCardFormat = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === "number") {
      formatted = value
        .replace(/\D/g, "")
        .substring(0, 16)
        .replace(/(\d{4})(?=\d)/g, "$1 ")
        .trim();
    } else if (name === "exp") {
      formatted = value.replace(/\D/g, "").substring(0, 4);
      if (formatted.length >= 3)
        formatted = `${formatted.slice(0, 2)}/${formatted.slice(2)}`;
    } else if (name === "cvv") {
      formatted = value.replace(/\D/g, "").substring(0, 3);
    }
    setCard((prev) => ({ ...prev, [name]: formatted }));
  };

  const handleOtpInput = (val, index) => {
    const newOtp = auth.otp.split("");
    newOtp[index] = val;
    setAuth({ ...auth, otp: newOtp.join("") });
  };

  const processPayment = () => {
    setStep(6); // Processing Screen
    setTimeout(async () => {
      // Tỷ lệ 10% rớt thẻ để Demo sự chân thực
      if (Math.random() > 0.9) {
        setFailReason(
          "Bank authorization failed. Please check your card balance.",
        );
        return setStep(8);
      }

      // 👉 FIX: Giả lập Frontend Bypass vì Backend chưa có API Payment
      try {
        /*
          // MÃ GỐC KHI CÓ BACKEND:
          const token = localStorage.getItem("petToken");
          const res = await fetch("http://localhost:5000/api/subscriptions/demo-upgrade", {...});
        */

        // MÃ DEMO MƯỢT MÀ:
        const updatedUser = { ...currentUser, plan: selectedTier.name };
        localStorage.setItem("petUser", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("userUpdated"));

        setStep(7); // Thành công!
      } catch (error) {
        console.error("Payment error:", error);
        setFailReason("Network error while connecting to payment gateway.");
        setStep(8);
      }
    }, 2000);
  };

  const prorateDiscount =
    selectedTier?.price === 19 ? 6.33 : selectedTier?.price === 9 ? 3.0 : 0;
  const totalCharge = selectedTier
    ? (selectedTier.price - prorateDiscount).toFixed(2)
    : 0;

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);

  // --- RENDER SCREENS ---
  if (step === 1) {
    const planRanks = { Free: 0, Premium: 1, Professional: 2, Enterprise: 3 };
    const currentRank = planRanks[currentPlan] || 0;

    return (
      <div className="min-h-screen bg-slate-50 pt-12 pb-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-500">
            Choose the perfect plan for your furry family members.
          </p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tiers.map((tier, idx) => {
            const thisPlanRank = planRanks[tier.name];
            let isCurrent = currentPlan === tier.name;
            let isDowngrade = thisPlanRank < currentRank;

            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl shadow-sm border relative flex flex-col transition-all duration-300 ${tier.popular ? "border-blue-600 shadow-blue-500/20 lg:scale-105 z-10" : "border-slate-200"}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={14} /> Most Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Current Plan
                  </div>
                )}
                <div className="p-8 flex-grow">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-slate-500 text-sm mb-6 h-10">
                    {tier.desc}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-slate-900">
                      {tier.price === "Custom" ? "" : "$"}
                      {tier.price}
                    </span>
                    <span className="text-slate-500">
                      {tier.price !== "Custom" ? "/mo" : ""}
                    </span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feat, i) => (
                      <li key={i} className="flex items-start">
                        <Check
                          size={20}
                          className="text-green-600 mr-3 shrink-0"
                        />
                        <span className="text-slate-600 font-medium">
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-8 pt-0 mt-auto">
                  <button
                    disabled={isCurrent || isDowngrade}
                    onClick={() => handleSelectPlan(tier)}
                    className={`w-full py-3 rounded-xl font-bold transition flex justify-center items-center gap-2 
                      ${
                        isCurrent || isDowngrade
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : tier.name === "Enterprise"
                            ? "bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-900/20" // 👉 FIX: Style Vip cho Enterprise
                            : tier.popular
                              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      }`}
                  >
                    {isCurrent
                      ? "Active"
                      : isDowngrade
                        ? "Contact Support to Downgrade"
                        : tier.btnText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const FlowHeader = ({ title, stepNum }) => (
    <div className="mb-8 animate-in fade-in slide-in-from-top-4">
      <button
        onClick={() => setStep(step - 1)}
        className="text-slate-500 hover:text-blue-600 flex items-center gap-2 mb-6 font-medium transition"
      >
        <ArrowLeft size={18} /> Back
      </button>
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <h2 className="text-3xl font-extrabold text-slate-900">{title}</h2>
        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          Step {stepNum} of 4
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 flex justify-center items-start">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10 min-h-[500px]">
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <FlowHeader title="Plan Comparison" stepNum={1} />
            <div className="grid grid-cols-3 text-sm border-b border-slate-200 font-bold text-slate-500 pb-3">
              <div className="col-span-1">Feature</div>
              <div className="text-center">Free (Current)</div>
              <div className="text-center text-blue-600">
                {selectedTier.name}
              </div>
            </div>
            <div className="divide-y divide-slate-100 mb-8">
              {[
                {
                  name: "Pet Profiles",
                  f: "1",
                  p: selectedTier.name === "Premium" ? "3" : "Unlimited",
                },
                {
                  name: "Storage",
                  f: "50MB",
                  p: selectedTier.name === "Premium" ? "5GB" : "Unlimited",
                },
                {
                  name: "AI Insights",
                  f: false,
                  p: selectedTier.name === "Professional",
                },
                {
                  name: "Telehealth Chat",
                  f: false,
                  p: selectedTier.name === "Professional",
                },
                { name: "Export Records", f: false, p: true },
              ].map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 py-4 text-sm items-center"
                >
                  <div className="font-medium text-slate-700">{row.name}</div>
                  <div className="text-center flex justify-center">
                    {typeof row.f === "boolean" ? (
                      row.f ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <X size={18} className="text-slate-300" />
                      )
                    ) : (
                      <span className="text-slate-500">{row.f}</span>
                    )}
                  </div>
                  <div className="text-center flex justify-center bg-blue-50/50 py-2 rounded-lg">
                    {typeof row.p === "boolean" ? (
                      row.p ? (
                        <Check size={18} className="text-blue-600" />
                      ) : (
                        <X size={18} className="text-slate-300" />
                      )
                    ) : (
                      <span className="font-bold text-blue-600">{row.p}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep(3)}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              Continue to Payment
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <FlowHeader title="Order Summary" stepNum={2} />
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8 space-y-4">
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Plan:</span>
                <span className="text-slate-900 font-bold">
                  {selectedTier.name} Tier
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Billing Cycle:</span>
                <span className="text-slate-900">Monthly</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Price:</span>
                <span className="text-slate-900">
                  ${selectedTier.price.toFixed(2)}/month
                </span>
              </div>
              <div className="flex justify-between font-medium text-green-600">
                <span className="">Prorate (remaining days):</span>
                <span className="">-${prorateDiscount.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                <span className="font-bold text-slate-900">
                  Total charged today:
                </span>
                <span className="text-3xl font-black text-blue-600">
                  ${totalCharge}
                </span>
              </div>
              <div className="text-xs text-slate-400 text-right">
                Next renewal: {nextMonth.toLocaleDateString("en-GB")} for $
                {selectedTier.price.toFixed(2)}
              </div>
            </div>
            <label className="flex items-start gap-3 mb-8 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreeTos}
                onChange={(e) => setAgreeTos(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-slate-600">
                I agree to the{" "}
                <span className="text-blue-600 font-medium group-hover:underline">
                  Terms of Service
                </span>{" "}
                and authorize PetAware to charge my payment method.
              </span>
            </label>
            <button
              disabled={!agreeTos}
              onClick={() => setStep(4)}
              className={`w-full py-4 rounded-xl font-bold transition ${agreeTos ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
            >
              Proceed to Payment
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <FlowHeader title="Secure Payment" stepNum={3} />
            <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-2 rounded-lg mb-6 w-max">
              <Shield size={16} /> 256-bit SSL Encrypted • Powered by Stripe
            </div>

            <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-xl">
              <button
                onClick={() => setPayMethod("card")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition flex items-center justify-center gap-2 ${payMethod === "card" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <CreditCard size={18} /> Card
              </button>
              <button
                onClick={() => setPayMethod("paypal")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition flex items-center justify-center gap-2 ${payMethod === "paypal" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                PayPal
              </button>
              <button
                onClick={() => setPayMethod("momo")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition flex items-center justify-center gap-2 ${payMethod === "momo" ? "bg-white text-pink-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <Smartphone size={18} /> Momo
              </button>
            </div>

            {payMethod === "card" && (
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    name="number"
                    value={card.number}
                    onChange={handleCardFormat}
                    placeholder="4242 4242 4242 4242"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      name="exp"
                      value={card.exp}
                      onChange={handleCardFormat}
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      name="cvv"
                      value={card.cvv}
                      onChange={handleCardFormat}
                      placeholder="***"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-mono tracking-widest"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={card.name}
                    onChange={handleCardFormat}
                    placeholder="J M SMITH"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none uppercase"
                  />
                </div>
              </div>
            )}

            {payMethod === "paypal" && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center mb-8">
                <p className="text-blue-800 font-medium mb-4">
                  You will be redirected to PayPal to securely complete your
                  purchase.
                </p>
                <button
                  disabled
                  className="bg-[#FFC439] text-slate-900 font-black italic px-8 py-3 rounded-full opacity-50 cursor-not-allowed"
                >
                  PayPal
                </button>
              </div>
            )}
            {payMethod === "momo" && (
              <div className="bg-pink-50 border border-pink-100 rounded-2xl p-8 text-center mb-8">
                <div className="w-32 h-32 bg-white border border-pink-200 mx-auto mb-4 rounded-xl flex items-center justify-center text-pink-300 font-bold">
                  QR CODE
                </div>
                <p className="text-pink-800 font-medium text-sm">
                  Open MoMo app and scan to pay.
                </p>
              </div>
            )}

            <button
              disabled={
                payMethod !== "card" ||
                card.number.length < 19 ||
                card.exp.length < 5 ||
                card.cvv.length < 3 ||
                card.name.length < 2
              }
              onClick={() => setStep(5)}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition disabled:opacity-50 flex justify-center items-center gap-2"
            >
              <Lock size={18} /> Confirm & Pay ${totalCharge}
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <FlowHeader title="Confirm Identity" stepNum={4} />
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full mx-auto flex items-center justify-center font-black text-2xl mb-4 border-4 border-white shadow-md">
                {currentUser.name
                  ? currentUser.name.charAt(0).toUpperCase()
                  : "U"}
              </div>
              <p className="font-bold text-slate-900 text-lg">
                {currentUser.name || "PetAware User"}
              </p>
              <p className="text-slate-500">
                {currentUser.email || "user@email.com"}
              </p>
            </div>

            {!auth.useOtp ? (
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Enter Password to authorize charge
                  </label>
                  <input
                    type="password"
                    value={auth.password}
                    onChange={(e) =>
                      setAuth({ ...auth, password: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-center text-xl tracking-widest"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  onClick={() => setAuth({ ...auth, useOtp: true })}
                  className="text-sm font-bold text-blue-600 w-full hover:underline"
                >
                  Use Email OTP instead
                </button>
              </div>
            ) : (
              <div className="space-y-6 mb-8">
                <label className="block text-sm font-bold text-slate-700 text-center">
                  Enter 6-digit code sent to email
                </label>
                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      maxLength={1}
                      className="w-12 h-14 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                      onChange={(e) => {
                        handleOtpInput(e.target.value, i);
                        if (e.target.value && i < 5)
                          document.getElementById(`otp-${i + 1}`).focus();
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setAuth({ ...auth, useOtp: false })}
                  className="text-sm font-bold text-slate-500 w-full hover:underline"
                >
                  Back to Password
                </button>
              </div>
            )}

            <button
              disabled={
                (!auth.useOtp && auth.password.length < 3) ||
                (auth.useOtp && auth.otp.length < 6)
              }
              onClick={processPayment}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Verify & Pay
            </button>
          </div>
        )}

        {step === 6 && (
          <div className="flex flex-col items-center justify-center h-[400px] animate-in fade-in duration-300 text-center">
            <Loader2 size={64} className="text-blue-600 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Processing your payment...
            </h2>
            <p className="text-slate-500 font-medium animate-pulse">
              Please do not close this window
            </p>
          </div>
        )}

        {step === 7 && (
          <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center text-center pt-8">
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-50">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              You're now on {selectedTier.name}!
            </h2>
            <p className="text-slate-500 mb-8">
              Thank you for upgrading your account.
            </p>

            <div className="w-full bg-slate-50 rounded-2xl p-6 text-left space-y-3 mb-6 border border-slate-100">
              <div className="flex justify-between border-b border-slate-200 pb-3">
                <span className="text-slate-500 font-medium">
                  Amount charged:
                </span>
                <span className="font-bold text-slate-900">${totalCharge}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-3">
                <span className="text-slate-500 font-medium">Plan:</span>
                <span className="font-bold text-blue-600">
                  {selectedTier.name} Tier
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-3">
                <span className="text-slate-500 font-medium">
                  Next renewal:
                </span>
                <span className="font-bold text-slate-900">
                  {nextMonth.toLocaleDateString("en-GB")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">
                  Confirmation #:
                </span>
                <span className="font-mono font-bold text-slate-900">
                  PA-{confirmationRef.current}
                </span>
              </div>
            </div>

            <div className="w-full bg-blue-50 text-blue-700 text-sm font-bold py-3 rounded-xl mb-8">
              A receipt has been sent to {currentUser.email || "your email"}.
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {step === 8 && (
          <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center text-center pt-8">
            <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50">
              <XCircle size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              Payment unsuccessful
            </h2>
            <p className="text-slate-500 mb-8 max-w-sm">{failReason}</p>

            <button
              onClick={() => setStep(4)}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition mb-4"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                setCard({ number: "", exp: "", cvv: "", name: "", save: true });
                setStep(4);
              }}
              className="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-50 transition"
            >
              Use Different Card
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
