import { Modal } from "../ui/Modal";

/**
 * Stage transition modal — prompts for notes before moving a ticket to a new stage.
 *
 * @param {boolean}  open
 * @param {Function} onClose
 * @param {string}   stageCode       - Target stage code
 * @param {Array}    stages           - Stages list from API
 * @param {string}   notesInput
 * @param {Function} onNotesChange
 * @param {Function} onSubmit        - Called with (e) on form submit
 */
export function StageTransitionModal({
    open,
    onClose,
    stageCode,
    stages,
    notesInput,
    onNotesChange,
    onSubmit,
}) {
    const stageObj = stages.find((s) => s.code === stageCode);

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={`Transition to: ${stageObj?.name ?? stageCode}`}
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <p className="text-sm text-on-surface-variant font-medium">
                    Add transition notes for this pipeline milestone. These are visible to shop owner and technician.
                </p>

                <div className="space-y-1.5">
                    <label className="font-bold text-xs text-outline uppercase" htmlFor="stage-notes-input">
                        Stage Notes (optional)
                    </label>
                    <textarea
                        id="stage-notes-input"
                        value={notesInput}
                        onChange={(e) => onNotesChange(e.target.value)}
                        rows="4"
                        placeholder={`e.g. Device transitioned to ${stageObj?.name ?? "next stage"}. Parts inspected, no liquid damage.`}
                        className="w-full border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm p-3 bg-surface outline-none"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full h-11 bg-primary text-on-primary rounded-lg font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 text-sm shadow"
                >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Confirm Stage Transition</span>
                </button>
            </form>
        </Modal>
    );
}
