import { useTranslation } from "react-i18next";
import { Heading } from "@/Components/Heading";
import { WinnerCollectionRow } from "./WinnerCollections.blocks";

export const WinnerCollections = ({ month }: { month: string }) => {
    const { t } = useTranslation();

    return (
        <div className="border-t border-theme-secondary-300 dark:border-theme-dark-700">
            <div className="p-8">
                <Heading level={4}>
                    {t("pages.collections.collection_of_the_month.winners_month", {
                        month,
                    })}
                </Heading>

                <div className="mt-4 rounded-md border border-theme-secondary-300 dark:border-theme-dark-700">
                    {[1, 2, 3].map((key) => {
                        return (
                            <WinnerCollectionRow
                                index={key}
                                image="https://i.seadn.io/gae/H-eyNE1MwL5ohL-tCfn_Xa1Sl9M9B4612tLYeUlQubzt4ewhr4huJIR5OLuyO3Z5PpJFSwdm7rq-TikAh7f5eUw338A2cy6HRH75?w=500&auto=format"
                                name="jfs ajfkas jfsla fjlskjfksl fkjlsd jfksldfj sklf jlskfjs"
                                key={key}
                                floorPrice="0.01231232312 ETH"
                                volume="0.01231232312 ETH"
                                votes="1.7k"
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
