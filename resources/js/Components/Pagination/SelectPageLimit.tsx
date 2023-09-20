import { useTranslation } from "react-i18next";
import { Listbox } from "@/Components/Form/Listbox";

const defaultOptions = [10, 25, 50, 100];
const urlParameterKey = "itemsPerPage";

export const SelectPageLimit = ({
    value = 10,
    onChange,
    options = defaultOptions,
}: {
    value?: string | number;
    options?: Array<string | number>;
    onChange?: ({ value, url }: { value: string | number; url: string }) => void;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Listbox
            className="w-full sm:w-40 md:w-[13.5rem]"
            optionsClassName="right-0 w-full sm :w-40 bottom-14"
            onChange={(value) => {
                const urlParameters = new URLSearchParams(window.location.href);
                urlParameters.set(urlParameterKey, String(value));
                onChange?.({ value, url: urlParameters.toString() });
            }}
            button={
                <Listbox.Button data-testid="Listbox__trigger">
                    <div className="absolute inset-0 flex h-full items-center">
                        <div className="flex h-full items-center rounded-l-xl border-r border-theme-secondary-400 bg-theme-secondary-50 px-4 text-theme-secondary-700">
                            {t("common.show")}
                        </div>

                        <div className="px-4 text-theme-secondary-700">
                            {value}
                            <span className="sm:hidden md:inline-block">&nbsp;{t("common.records")}</span>
                        </div>
                    </div>
                </Listbox.Button>
            }
        >
            {options.map((value, key) => (
                <Listbox.Option
                    key={key}
                    value={value}
                >
                    {value}
                </Listbox.Option>
            ))}
        </Listbox>
    );
};
