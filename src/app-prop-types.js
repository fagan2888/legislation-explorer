import {PropTypes} from "react"


// Level 0 PropTypes

const startStopValue = PropTypes.shape({
  start: PropTypes.string.isRequired,
  stop: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.number,
  ]).isRequired,
  // Introspection (optional: values can be generated programmatically)
  start_line_number: PropTypes.number,
  end_line_number: PropTypes.number,
})

const unit = PropTypes.oneOf([
  "currency",
  "day",
  "hour",
  "month",
  "year",
])

const parameter = PropTypes.shape({
  description: PropTypes.string,
  id: PropTypes.string,
  normalizedDescription: PropTypes.string,
  values: PropTypes.objectOf(PropTypes.number),
})

const scale = PropTypes.shape({
  "@type": PropTypes.oneOf(["Scale"]).isRequired,
  brackets: PropTypes.arrayOf(
    PropTypes.shape({
      rate: PropTypes.arrayOf(startStopValue).isRequired,
      threshold: PropTypes.arrayOf(startStopValue).isRequired,
      // Introspection (optional: values can be generated programmatically)
      start_line_number: PropTypes.number,
      end_line_number: PropTypes.number,
    }),
  ),
  description: PropTypes.string,
  unit,
  // Introspection (optional: values can be generated programmatically)
  xml_file_path: PropTypes.string,
  start_line_number: PropTypes.number,
  end_line_number: PropTypes.number,
})

export const variable = PropTypes.shape({
  formula: PropTypes.object,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  normalizedDescription: PropTypes.string,
  // Introspection (optional: variables declared in notebooks have no introspection attributes)
  source_file_path: PropTypes.string,
  start_line_number: PropTypes.number,
  end_line_number: PropTypes.number,
})

export const parameterOrScale = PropTypes.oneOfType([
  parameter,
  scale,
])
