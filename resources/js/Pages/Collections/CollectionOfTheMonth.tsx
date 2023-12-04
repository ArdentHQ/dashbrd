import { type PageProps } from "@inertiajs/core";
import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { DefaultLayout } from "@/Layouts/DefaultLayout";

interface CollectionOfTheMonthProperties extends PageProps {
    title: string;
}

const CollectionOfTheMonth = ({ title }: CollectionOfTheMonthProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <DefaultLayout wrapperClassName="-mt-6 sm:-mt-8 lg:mt-0 -mb-6 sm:-mb-8 lg:mb-0">
            <Head title={title} />

            <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae rerum exercitationem qui numquam
                dicta. Dicta dignissimos ratione ut maxime eligendi nisi iusto minus aliquam porro enim reprehenderit,
                illum labore ea.
            </p>
        </DefaultLayout>
    );
};

export default CollectionOfTheMonth;
