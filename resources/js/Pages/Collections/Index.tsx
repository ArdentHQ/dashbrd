import { Head, usePage } from "@inertiajs/react";
import { DefaultLayout } from "@/Layouts/DefaultLayout";

const CollectionsIndex = ({ title }: { title: string }): JSX.Element => {
    const { props } = usePage();

    return (
        <DefaultLayout toastMessage={props.toast}>
            <Head title={title} />
        </DefaultLayout>
    );
};

export default CollectionsIndex;
