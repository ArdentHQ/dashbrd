import { Icon } from "@/Components/Icon";

export const LoadingBlock = ({ text }: { text?: string }): JSX.Element => (
    <div
        data-testid="LoadingBlock"
        className="rounded-xl border border-theme-secondary-300 p-4 text-center font-medium text-theme-secondary-900"
    >
        <div className="flex items-center justify-center space-x-3">
            <Icon
                size="xl"
                name="Spinner"
                className="animate-spin text-theme-hint-600"
            />
            <div>{text}</div>
        </div>
    </div>
);
