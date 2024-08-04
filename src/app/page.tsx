import InitForm from "./_components/initForm";
import React from "react";

const AnimatedCircles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="circle circle-1"></div>
      <div className="circle circle-2"></div>
      <div className="circle circle-3"></div>
    </div>
  );
};

export default async function Home() {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center">
      <AnimatedCircles />
      <div className="grid min-h-screen w-full place-content-center backdrop-blur-3xl">
        <InitForm />
      </div>
    </div>
  );
}
