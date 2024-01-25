import sprites from "@/assets/images/sprites.svg";

interface SVGProps {
  id?: string;
  width?: number;
  height?: number;
}

const SVG: React.FC<SVGProps> = ({ id, width, height }) => {
  return (
    <svg width={width} height={height}>
      <use xlinkHref={`${sprites}#${id}`} />
    </svg>
  );
};

export default SVG;
