import Header from './Header'
import Content from './Content'

const Course = ({ course }) => {
  const total = course.parts.reduce((sum, part) => sum + part.exercises, 0)

  return (
    <div>
      <Header name={course.name} />
      <Content parts={course.parts} />
      <strong>Total exercises: {total}</strong>
    </div>
  )
}

export default Course
