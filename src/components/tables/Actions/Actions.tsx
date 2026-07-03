import {useState} from "react";
import {Link} from "react-router";
import {PencilIcon, TrashBinIcon} from "../../../icons";
import DeleteModal from "../../common/DeleteModal.tsx";

interface Props {
    id: string;
    deleteFunction: (id: string) => Promise<void>; // async function
    isPending: boolean;
}

function Actions({id, deleteFunction, isPending}: Props) {
    const [deleteModal, setDeleteModal] = useState(false);

    const handleDelete = () => {
        setDeleteModal(true);
    };

    return (
        <>
            <div className="flex items-center gap-3 z-9999999">
                {/* Edit button */}
                <Link
                    to={`/roles/update/${id}`}
                    className="flex items-center text-green-600 hover:text-green-800"
                >
                    <PencilIcon className='text-2xl'/>
                </Link>

                {/* Delete button */}
                <button
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-800 text-lg"
                >
                    <TrashBinIcon className='text-2xl'/>
                </button>
            </div>

            {/*{deleteModal && (*/}
                <DeleteModal
                    isPending={isPending}
                    setOpen={setDeleteModal}
                    open={deleteModal}
                    deleteFunction={() => deleteFunction(id)}
                />
            {/*)}*/}
        </>
    );
}

export default Actions;