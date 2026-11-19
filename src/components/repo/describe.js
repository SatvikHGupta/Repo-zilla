// the exporter cuts list descriptions at 140 characters, so a description that long was probably cut
const CUT = 140;
export const cutDescription = (d) => (d ? (d.length >= CUT ? d.trimEnd() + '…' : d) : '');
