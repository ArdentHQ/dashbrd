import { Tab } from "@headlessui/react";
import cn from "classnames";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { type GalleryFormSliderProperties, GalleryFormSliderTabs } from "./GalleryFormSlider.contracts";
import { GallerySelectTemplate } from "@/Components/Galleries/GalleryPage/GallerySelectTemplate";
import { GalleryUploadCover } from "@/Components/Galleries/GalleryPage/GalleryUploadCover";
import { Slider } from "@/Components/Slider";
import { Tabs } from "@/Components/Tabs";

export const GalleryFormSlider = ({
    galleryCoverUrl,
    onSaveCoverUrl,
    activeTab = GalleryFormSliderTabs.Template,
    isOpen,
    onClose,
}: GalleryFormSliderProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <>
            <Slider
                isOpen={isOpen}
                onClose={onClose}
                data-testid="GalleryFormSlider"
            >
                <Tab.Group
                    as="div"
                    defaultIndex={activeTab}
                >
                    <Slider.Header>
                        <Tab.List className="lg:hidden">
                            <Tabs>
                                <Tab as={Fragment}>
                                    {({ selected }) => (
                                        <Tabs.Button selected={selected}>
                                            <span>{t("pages.galleries.create.templates.template")}</span>
                                        </Tabs.Button>
                                    )}
                                </Tab>

                                <Tab as={Fragment}>
                                    {({ selected }) => (
                                        <Tabs.Button selected={selected}>
                                            <span>{t("pages.galleries.create.templates.cover")}</span>
                                        </Tabs.Button>
                                    )}
                                </Tab>
                            </Tabs>
                        </Tab.List>
                        <div className="hidden lg:block">
                            {activeTab === GalleryFormSliderTabs.Template && (
                                <span className="text-lg font-medium ">
                                    {t("pages.galleries.create.templates.select")}
                                </span>
                            )}

                            {activeTab === GalleryFormSliderTabs.Cover && (
                                <div className="text-lg font-medium">
                                    {t("pages.galleries.create.gallery_cover")}
                                    <span className="text-theme-secondary-500"> {t("common.optional")}</span>
                                </div>
                            )}
                        </div>
                    </Slider.Header>

                    <Tab.Panels>
                        <Tab.Panel>
                            <Slider.Content className={cn("relative pb-24")}>
                                <GallerySelectTemplate onCancel={onClose} />
                            </Slider.Content>
                        </Tab.Panel>

                        <Tab.Panel>
                            <Slider.Content className={cn("relative pb-24")}>
                                <GalleryUploadCover
                                    coverUrl={galleryCoverUrl}
                                    onSave={onSaveCoverUrl}
                                    onCancel={onClose}
                                />
                            </Slider.Content>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </Slider>
        </>
    );
};
