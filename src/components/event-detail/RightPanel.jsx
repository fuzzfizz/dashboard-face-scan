import ParticipantGrid from './ParticipantGrid'
import SummaryBar from './SummaryBar'

export default function RightPanel({ participants, summary, selectedId, onSelect }) {
  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-gray-950 transition-colors">
      <ParticipantGrid
        participants={participants}
        selectedId={selectedId}
        onSelect={onSelect}
      />
      <SummaryBar summary={summary} />
    </div>
  )
}
