import backgroundImage from "../static/img/bg.png";

export function GameplaySvgMask() {
  return (
    <svg
      id="bg-mask"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <mask id="holeMask">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <rect id="cut" x="0" y="160" width="1920" height="710" fill="black" />
        </mask>
      </defs>

      <image
        href={backgroundImage}
        x="0"
        y="0"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        mask="url(#holeMask)"
      />
    </svg>
  );
}
