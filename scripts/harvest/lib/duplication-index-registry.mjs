/** Canonical hub BY-KIND slices consulted for harvest publication duplication checks. */
export const DUPLICATION_INDEX_REGISTRY = [
  {
    id: "thread-autopsy-index",
    sliceFile: "thread-autopsy-index.json",
    required: true,
    lane: "thread-autopsy",
  },
  {
    id: "harvest-protocol-self-learning-index",
    sliceFile: "harvest-protocol-self-learning-index.json",
    required: false,
    lane: "lane-c",
  },
  {
    id: "prompt-harvest-index",
    sliceFile: "prompt-harvest-index.json",
    required: false,
    lane: "promptops",
  },
  {
    id: "active-work-blockers",
    sliceFile: "active-work-blockers.json",
    required: true,
    lane: "suite-status",
  },
  {
    id: "do-not-advance",
    sliceFile: "do-not-advance.json",
    required: false,
    lane: "guards",
  },
  {
    id: "active-work-open-actions",
    sliceFile: "active-work-open-actions.json",
    required: false,
    lane: "suite-status",
  },
];

export function requiredDuplicationSliceNames() {
  return DUPLICATION_INDEX_REGISTRY.filter((e) => e.required).map((e) => e.sliceFile);
}

export function allDuplicationSliceNames() {
  return DUPLICATION_INDEX_REGISTRY.map((e) => e.sliceFile);
}
