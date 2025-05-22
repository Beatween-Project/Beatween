import bassImage from "./assets/images/bass.svg";
import drumImage from "./assets/images/drum.svg";
import guitarImage from "./assets/images/guitar.svg";
import keyboardImage from "./assets/images/keyboard.svg";
import microImage from "./assets/images/micro.svg";
import personImage from "./assets/images/personwhite.svg";
import tapeOneImage from "./assets/images/tape01.svg";
import tapeTwoImage from "./assets/images/tape02.svg";

export const LandingPage = () => {
  return (
    <div
      className={`z-0 overflow-hidden w-full h-full relative flex items-center justify-center text-center p-8 bg-blue-gradient`}
    >
      <div className="z-[-3] w-full h-full absolute inset-0 bg-noise gradient"></div>
      <img
        src={bassImage}
        alt="bass image"
        className="absolute bottom-[20%] right-[10%] w-[calc(35vw+40vh)] translate-x-[63%] translate-y-[80%]"
      />
      <img
        src={drumImage}
        alt="drum image"
        className="absolute top-[30%] z-[-2] right-[10%] w-[calc(15vw+40vh)] translate-x-[50%] -translate-y-[90%]"
      />
      <img
        src={guitarImage}
        alt="guitar image"
        className="absolute bottom-[10%] left-[5%] w-[calc(16vw+31vh)] -translate-x-[64%] -translate-y-[16%]"
      />
      <img
        src={keyboardImage}
        alt="keyboard image"
        className="absolute top-[47%] left-[17%] z-[-1] w-[calc(5vw+40vh)] -translate-x-[45%] -translate-y-[160%]"
      />
      <img
        src={microImage}
        alt="microphone image"
        className="absolute bottom-[10%] left-0 w-[calc(6vw+43vh)] -translate-x-[20%] translate-y-[66%]"
      />
      <img
        src={personImage}
        alt="person image"
        className="absolute w-[8vw] z-[2] -translate-x-[22%] translate-y-[22%]"
      />
      <img
        src={tapeOneImage}
        alt="tape image"
        className="absolute z-[-2] w-[calc(17vw+30vh)] -translate-x-[2%] -translate-y-[67%]"
      />
      <img
        src={tapeTwoImage}
        alt="tape image"
        className="absolute w-[calc(20vw+33vh)] -translate-x-[7%] translate-y-[46%]"
      />
      <div className="text-neutral100 text-[14vw] flex gap-28">
        <span className="font-cafe24">BEAT</span>
        <span className="font-cafe24">WEEN</span>
      </div>
    </div>
  );
};
