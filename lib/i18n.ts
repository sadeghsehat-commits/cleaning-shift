// Language types
export type Language = 'en' | 'ar' | 'uk' | 'it';

// Translation keys type - we'll expand this as we add more translations
export interface Translations {
  // Common
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    view: string;
    back: string;
    next: string;
    previous: string;
    confirm: string;
    yes: string;
    no: string;
    submit: string;
    search: string;
    filter: string;
    clear: string;
    close: string;
    select: string;
    required: string;
    optional: string;
    unknown: string;
    na: string;
  };
  
  // Navigation
  nav: {
    home: string;
    shifts: string;
    apartments: string;
    users: string;
    notifications: string;
    history: string;
    reports: string;
    calendar: string;
    schedule: string;
    logout: string;
    login: string;
  };
  
  // Roles
  roles: {
    admin: string;
    owner: string;
    operator: string;
    cleaner: string;
  };
  
  // Status
  status: {
    scheduled: string;
    inProgress: string;
    completed: string;
    cancelled: string;
    pending: string;
    confirmed: string;
  };
  
  // Dashboard
  dashboard: {
    title: string;
    calendar: string;
    shiftsFor: string;
    noShifts: string;
    viewDetails: string;
    apartmentOwner: string;
    createdBy: string;
    scheduledTime: string;
    operator: string;
    apartment: string;
    address: string;
    date: string;
    startTime: string;
    endTime: string;
    notes: string;
    owner: string;
    weeklySchedule: string;
  };
  
  // Shifts
  shifts: {
    title: string;
    createNew: string;
    newShift: string;
    edit: string;
    delete: string;
    deleteAll: string;
    deleting: string;
    deleteConfirm: string;
    deleteSuccess: string;
    createSuccess: string;
    updateSuccess: string;
    deleteError: string;
    createError: string;
    updateError: string;
    selectOwner: string;
    selectApartment: string;
    selectOperator: string;
    selectDate: string;
    checkoutDays: string;
    extraCleaningDay: string;
    alreadyHasShift: string;
    minimumTime: string;
    selectedDate: string;
    noAvailableApartments: string;
    noShiftsFound: string;
    manageAll: string;
    all: string;
    started: string;
    notAssigned: string;
    unknownApartment: string;
    addressNotAvailable: string;
    unknownOwner: string;
    shiftDetails: string;
    apartmentInformation: string;
    prepareApartment: string;
    guests: string;
    guest: string;
    guestsExpected: string;
    shiftInformation: string;
    schedule: string;
    timeChangeRequests: string;
    activeTimeChangeRequest: string;
    currentTime: string;
    newTime: string;
    requestTimeChange: string;
    startCleaning: string;
    reportProblem: string;
    pleaseWait: string;
    minutesUntil: string;
    operatorConfirmed: string;
    awaitingConfirmation: string;
    shiftConfirmedByOperator: string;
    waitingForOperatorConfirmation: string;
  };
  
  // Instructions
  instructions: {
    title: string;
    addInstruction: string;
    instructionPhotos: string;
    addPhoto: string;
    description: string;
    descriptionPlaceholder: string;
    uploadPhoto: string;
    photoUploaded: string;
    photoDeleted: string;
    uploadError: string;
    noPhotos: string;
    uploadedBy: string;
    uploadedAt: string;
  };
  
  // Problems
  problems: {
    title: string;
    reportProblem: string;
    problemDescription: string;
    problemType: string;
    issue: string;
    forgottenItem: string;
    reportSuccess: string;
    reportError: string;
    noProblems: string;
    resolved: string;
    unresolved: string;
    reportedBy: string;
    reportedAt: string;
  };
  
  // Notifications
  notifications: {
    title: string;
    noNotifications: string;
    markAsRead: string;
    markAllAsRead: string;
    deleteAll: string;
    deleteConfirm: string;
  };
  
  // Messages/Toast
  messages: {
    success: string;
    error: string;
    warning: string;
    info: string;
    saved: string;
    deleted: string;
    updated: string;
    created: string;
    failed: string;
    unauthorized: string;
    forbidden: string;
    notFound: string;
    serverError: string;
  };
}

