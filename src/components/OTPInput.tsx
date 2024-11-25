"use client";

import { useState, useRef, useEffect, JSX, type KeyboardEvent } from "react";

export const OTPInput = (): JSX.Element => {
  const [otp, setOtp] = useState(["", "", "", "", "", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 7 && value !== "") {
      handleSubmit(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (otpValue: string) => {
    console.log("OTP submitted:", otpValue);
    // Here you would typically send the OTP to your server for verification
  };

  return (
    <div className="flex justify-center space-x-4">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="w-12 h-16 text-2xl text-center border-b-2 border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
        />
      ))}
    </div>
  );
};
