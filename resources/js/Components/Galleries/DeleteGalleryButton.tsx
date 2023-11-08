import { Button } from "@/Components/Buttons";

const DeleteGalleryButton = ({ onDelete }: { onDelete: React.MouseEventHandler<HTMLButtonElement> }): JSX.Element => (
    <Button
        icon="Trash"
        onClick={(event) => {
            onDelete(event);
        }}
        variant="secondary"
        iconSize="md"
        className="bg-transparent p-2"
        data-testid="DeleteGalleryButton"
    />
);

export default DeleteGalleryButton;
