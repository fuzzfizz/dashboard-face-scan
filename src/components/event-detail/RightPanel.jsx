import ParticipantGrid from './ParticipantGrid'

export default function RightPanel({ participants, selectedId, onSelect }) {
  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-gray-950 transition-colors">
      <ParticipantGrid
        participants={participants}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </div>
  )
}

