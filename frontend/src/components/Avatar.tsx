import { colorForId, initialsFor } from "../theme/tokens";

interface AvatarProps {
  id: number | string;
  name: string;
  size?: number;
}

export function Avatar({ id, name, size = 28 }: AvatarProps) {
  return (
    <div
      className="avatar"
      title={name}
      style={{
        width: size,
        height: size,
        background: colorForId(id),
        fontSize: size * 0.4,
      }}
    >
      {initialsFor(name)}
    </div>
  );
}
