interface Properties {
    width?: string;
    height?: string;
    color?: string;
    className?: string;
}

export const Point = ({
    width = "w-[5px]",
    height = "h-[5px]",
    color = "secondary-400",
    className,
}: Properties): JSX.Element => (
    <div className={`${width} ${height} rounded-full bg-theme-${color} dark:bg-theme-dark-700 ${className}`} />
);
