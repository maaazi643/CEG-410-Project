"use client";

import { useState } from "react";
import Cooking from "./assets/Group 112 (1).svg";
import left from "./assets/Star 15.svg";
import right from "./assets/Star 16.svg";
import Logo from "./assets/Group 86 (1).svg";
import Modal from "./components/Modal";
import Image from "next/image";

const SignUpPage = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Image
        src={Logo}
        alt="Nexstack Logo"
        priority
        height={300}
        className="w-[170px] p-6 md:w-[180px] md:p-7 lg:w-[200px] lg:p-8"
      />
      {/* <hr className="h-px my-8 bg-gray-200 border-0 md:hidden lg:hidden"></hr> */}
      <div className="flex flex-col justify-center items-center mx-7 md:mx-20 lg:mx-32">
        <Image
          src={Cooking}
          alt="We're Cooking"
          className="mt-7 md:mt-16 lg:mt-20"
        />
        <h2 className="text-3xl font-bold text-center mt-3 p-4 md:text-4xl lg:text-5xl">
          Join the waitlist to get notified when we launch!
        </h2>
        <div className=" flex justify-around items-center  lg:mb-10 md:mb-8 md:mt-3 lg:mt-5 ">
          <Image src={left} alt="Left Image" className="w-[19px]" />
          <p className="mx-2 text-gray-500  text-base font-medium text-center md:mx-10 lg:mx-28">
            We’re building something very amazing and we can’t wait to let you
            see it first.
          </p>
          <Image src={right} alt="Right Image" className="w-[19px] top-0 " />
        </div>
        <input
          type="email"
          placeholder="Input your email"
          className="mt-8 text-center border rounded border-[#DA004C] p-2 md:px-6 lg:px-[58px]"
        />
        <button
          type="submit"
          className="mt-6 text-white text-center bg-[#DA004C] rounded py-2 px-[60px] md:px-20 lg:px-28"
          onClick={openModal}
        >
          Join the waitlist
        </button>
      </div>

      <Modal open={modalOpen} onClose={closeModal}>
        <div className="flex flex-col items-center justify-center px-4 py-10 md:py-12 md:px-7 ">
          <h3 className=" text-2xl font-extrabold text-center text-black md:text-4xl">
            Successful!
          </h3>
          <p className="text-center text-sm font-medium text-black mt-2 md:text-xl md:mt-5">
            You’ve been added to our waitlist and you’ll be from the first set
            of people to get updated when we launch.
          </p>
          <button
            type="submit"
            className=" bg-[#DA004C] max-[400px]:w-2/3  text-base md:text-2xl text-white py-2 px-12 max-[350px]:px-10 md:px-20 text-center font-semibold rounded mt-6 md:mt-8"
            onClick={closeModal}
          >
            Done
          </button>
        </div>
      </Modal>
    </>
  );
};

export default SignUpPage;

{
  /* <div className=" flex justify-between items-center">
      <Image src={left} alt="Left Image" className="w-[19px] mb-36" />
      <p class="mx-2 text-gray-500  text-base font-medium text-center mb-52  ">
        We’re building something very amazing and we can’t wait to let you
        see it first.
      </p>
      <Image src={right} alt="Right Image" className="w-[19px] mb-96 " />
    </div> */
}

{
  /*     
  <div className="flex flex-col items-center justify-center h-full">
    <Image src={Cooking} alt="....." className="mt-16" />
    <h2 className="mt-8 text-6xl font-extrabold text-center text-black w-[70%]">
      Join the waitlist to get notified when we launch!
    </h2>
    <div className=" flex justify-between items-center gap-24">
      <Image src={left} alt="...." />
      <p className=" font-medium text-2xl mt-5 text-center text-black w-[60%]">
        We’re building something very amazing and we can’t wait to let you
        see it first.
      </p>
      <Image src={right} alt="...." />
  </div> */
}
