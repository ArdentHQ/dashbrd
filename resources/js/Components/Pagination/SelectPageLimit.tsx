import cn from "classnames";
import { useTranslation } from "react-i18next";
import { Listbox } from "@/Components/Form/Listbox";

const defaultOptions = [10, 25, 50, 100];
const urlParameterKey = "itemsPerPage";

export const SelectPageLimit = ({
    value = 10,
    onChange,
    options = defaultOptions,
    suffix,
    className,
    optionClassName,
}: {
    value?: string | number;
    options?: Array<string | number>;
    onChange?: ({ value, url }: { value: string | number; url: string }) => void;
    suffix: string;
    className?: string;
    optionClassName?: string;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Listbox
            className={cn("w-full sm:flex sm:justify-between xs:w-48", className)}
            optionsClassName={cn("right-0 w-32 bottom-16 rounded-xl", optionClassName)}
            onChange={(value) => {
                const urlParameters = new URLSearchParams(window.location.href);
                urlParameters.set(urlParameterKey, String(value));
                onChange?.({ value, url: urlParameters.toString() });
            }}
            button={
                <Listbox.Button data-testid="Listbox__trigger">
                    <div className="absolute inset-0 flex h-full items-center">
                        <div className="flex h-full items-center rounded-l-xl border-r border-theme-secondary-400 bg-theme-secondary-50 px-4 text-theme-secondary-700 dark:border-theme-dark-500 dark:bg-theme-dark-800 dark:text-theme-dark-200">
                            {t("common.show")}
                        </div>

                        <div className="px-4 text-theme-secondary-700 dark:text-theme-dark-200">
                            {value}
                            <span> {suffix}</span>
                        </div>
                    </div>
                </Listbox.Button>
            }
        >
            {options.map((value, key) => (
                <Listbox.Option
                    key={key}
                    value={value}
                    hasGradient
                >
                    {value}
                </Listbox.Option>
            ))}
        </Listbox>
    );
};
