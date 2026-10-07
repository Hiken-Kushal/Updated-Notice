export const TARGET_AUDIENCES = [
  'FY-BTECH',
  'SY-BTECH',
  'TY-BTECH',
  'FINAL YEAR',
  'FINAL YEAR ENGG',
  'SY-IMCA',
  'TY-IMCA',
  'SY-IMBA',
  'TY-IMBA',
  'FY-MCA',
  'SY-MCA',
  'FY-MBA',
  'SY-MBA',
  'FY-MTECH',
  'ST-MTECH',
  'ALL STUDENTS',
  'ALL STUDENTS & FACULTY',
] as const;

export const DEPARTMENT_ACADEMIC_TARGETS = [
  'SY-BTECH',
  'TY-BTECH',
  'FINAL YEAR',
] as const;

export const FINAL_YEAR_PROGRAMS = [
  'COMPUTER ENGINEERING',
  'IT',
  'AI-DS',
  'MECHANICAL',
  'ENTC',
] as const;

export interface DepartmentTargetSelection {
  academicTarget: (typeof DEPARTMENT_ACADEMIC_TARGETS)[number];
  program?: (typeof FINAL_YEAR_PROGRAMS)[number];
}

const isAcademicTarget = (value: string): value is DepartmentTargetSelection['academicTarget'] =>
  DEPARTMENT_ACADEMIC_TARGETS.some((target) => target === value);

export const isDepartmentAcademicTarget = (value: string): value is DepartmentTargetSelection['academicTarget'] =>
  isAcademicTarget(value);

const isProgram = (value: string): value is DepartmentTargetSelection['program'] & string =>
  FINAL_YEAR_PROGRAMS.some((program) => program === value);

export const createDepartmentTargetAudience = (
  academicTarget: DepartmentTargetSelection['academicTarget'],
  program?: DepartmentTargetSelection['program']
): string =>
  program
    ? `${academicTarget}|${program}`
    : academicTarget;

export const parseDepartmentTargetAudience = (
  targetAudience: string
): DepartmentTargetSelection | null => {
  const parts = targetAudience.split('|');
  const isLegacyDepartmentTarget = parts[0] === 'Department';
  const rawAcademicTarget = isLegacyDepartmentTarget ? parts[1] : parts[0];
  const program = isLegacyDepartmentTarget ? parts[2] : parts[1];
  if (
    parts.length < 2 ||
    parts.length > (isLegacyDepartmentTarget ? 3 : 2) ||
    !rawAcademicTarget
  ) {
    return null;
  }
  const academicTarget = rawAcademicTarget === 'FINAL YEAR ENGG'
    ? 'FINAL YEAR'
    : rawAcademicTarget;
  if (!isAcademicTarget(academicTarget)) {
    return null;
  }
  if (program) {
    if (!isProgram(program)) {
      return null;
    }
    return { academicTarget, program };
  }
  return { academicTarget };
};

export const formatDepartmentTargetAudience = (targetAudience: string): string => {
  const selection = parseDepartmentTargetAudience(targetAudience);
  if (!selection) {
    return isAcademicTarget(targetAudience)
      ? `Department: ${targetAudience}`
      : targetAudience;
  }
  return selection.program
    ? `Department: ${selection.academicTarget} - ${selection.program}`
    : `Department: ${selection.academicTarget}`;
};
