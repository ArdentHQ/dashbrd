interface Properties {
    width?: string;
    height?: string;
    color?: string;
}

export const Point = ({ width = "w-[5px]", height = "h-[5px]", color = "secondary-400" }: Properties): JSX.Element => (
    <div className={`${width} ${height} rounded-full bg-theme-${color}`} />
);
