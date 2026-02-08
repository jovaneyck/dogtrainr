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
    <table>
      <thead>
        <tr>
          {DAYS.map(day => (
            <th key={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {DAYS.map(day => (
            <td key={day}>
              {schedule[day]?.map(trainingId => (
                <div key={trainingId}>
                  <Link to={`/trainings/${trainingId}`}>{getTrainingName(trainingId)}</Link>
                </div>
              ))}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}

export default TrainingPlanSchedule
