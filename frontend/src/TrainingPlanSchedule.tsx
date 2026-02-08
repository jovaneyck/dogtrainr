import { Link } from 'react-router-dom'

interface Training {
  id: string
  name: string
}

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

interface TrainingPlanScheduleProps {
  schedule: Record<string, string[]>
  trainings: Training[]
}

function TrainingPlanSchedule({ schedule, trainings }: TrainingPlanScheduleProps) {
  const getTrainingName = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId)
    return training?.name || trainingId
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map(day => (
          <div key={day} className="flex flex-col gap-2">
            <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium text-center">
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </div>
            <div className="flex flex-col gap-1">
              {schedule[day]?.map(trainingId => (
                <Link
                  key={trainingId}
                  to={`/trainings/${trainingId}`}
                  className="text-blue-600 hover:text-blue-700 text-sm transition-colors"
                >
                  {getTrainingName(trainingId)}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrainingPlanSchedule
