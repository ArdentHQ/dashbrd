import classNames from "classnames";

interface Properties extends React.HTMLAttributes<HTMLDivElement> {}

const LayoutContainer = ({ children, className, ...properties }: Properties): JSX.Element => (
    <div
        className={classNames("mx-auto max-w-site-content px-4 sm:px-8 lg:px-16", className)}
        {...properties}
    >
        {children}
    </div>
);

export default LayoutContainer;
