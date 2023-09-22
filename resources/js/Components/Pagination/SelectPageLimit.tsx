import { useTranslation } from "react-i18next";
import { Listbox } from "@/Components/Form/Listbox";

const defaultOptions = [10, 25, 50, 100];
const urlParameterKey = "itemsPerPage";

export const SelectPageLimit = ({
    value = 10,
    onChange,
    options = defaultOptions,
    suffix,
}: {
    value?: string | number;
    options?: Array<string | number>;
    onChange?: ({ value, url }: { value: string | number; url: string }) => void;
    suffix: string;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Listbox
            className="w-full xs:w-[12rem] sm:flex sm:justify-between"
            optionsClassName="right-0 w-32 bottom-16 rounded-xl"
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
                            <span className=" md:inline-block">&nbsp; {suffix}</span>
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
