import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons/Button";
import { IconButton } from "@/Components/Buttons/IconButton";
import { Heading } from "@/Components/Heading";
import { Tooltip } from "@/Components/Tooltip";

export const DashboardHeader = ({
    onSend,
    onReceive,
    balance,
}: {
    balance?: number;
    onSend?: () => void;
    onReceive?: () => void;
}): JSX.Element => {
    const { t } = useTranslation();

    const sendingDisabled = (balance ?? 0) === 0;

    return (
        <div
            data-testid="DashboardHeader"
            className="flex items-center justify-center sm:justify-between"
        >
            <Heading
                level={1}
                className="m-0 hidden sm:block"
            >
                {t("pages.dashboard.title")}
            </Heading>

            <div className="flex space-x-3">
                <div>
                    <Tooltip
                        content={sendingDisabled ? t("pages.token_panel.insufficient_funds") : t("common.send")}
                        touch={false}
                        disabled={!sendingDisabled}
                        zIndex={50}
                    >
                        <div data-testid="DashboardHeader__send">
                            <Button
                                disabled={sendingDisabled}
                                onClick={onSend}
                                icon="FatArrowUp"
                                variant="primary"
                                className="hidden sm:block"
                            >
                                {t("common.send")}
                            </Button>
                        </div>
                    </Tooltip>
                </div>

                <div data-testid="DashboardHeader__receive">
                    <Button
                        onClick={onReceive}
                        icon="FatArrowDown"
                        variant="secondary"
                        className="hidden md:flex"
                    >
                        {t("common.receive")}
                    </Button>

                    <Tooltip
                        content={t("common.receive")}
                        touch={true}
                        zIndex={50}
                    >
                        <IconButton
                            onClick={onReceive}
                            icon="FatArrowDown"
                            variant="secondary"
                            className="hidden sm:flex md:hidden"
                        />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};
