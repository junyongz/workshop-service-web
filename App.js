// Use global React and ReactDOM exposed from index.html
const { useState, useEffect, useReducer, useContext, createContext } = window.React;
const ReactDOM = window.ReactDOM;

const createRoot = ReactDOM.createRoot || ReactDOM.render;

const tasksData = {
  engine: [
    { name: 'Check Oil Level', type: 'maintenance', price: 35, unit: 'jobs', part: 'engine' },
    { name: 'Inspect Belts', type: 'inspection', price: 22.5, unit: 'jobs', part: 'engine' },
  ],
  fuel: [
    { name: 'Refill Tank', type: 'maintenance', price: 17.5, unit: 'jobs', part: 'fuel' },
    { name: 'Replace Filter', type: 'repair', price: 75, unit: 'jobs', part: 'fuel' },
  ],
  refill: [
    { name: 'Refill Engine Oil', type: 'refill', price: 5, unit: 'litres', part: 'refill' },
    { name: 'Refill Gear Oil', type: 'refill', price: 10, unit: 'litres', part: 'refill' },
  ],
};

const getTaskTypes = () => {
  const types = new Set();
  Object.values(tasksData).forEach(tasks => tasks.forEach(task => types.add(task.type)));
  return ['all', ...Array.from(types)];
};

// Utility function to initialize category badges dynamically
const initializeCategoryBadges = (tasksData, selectedTasks) => {
  const parts = Object.keys(tasksData || {});
  const initialBadges = {};
  parts.forEach(part => {
    initialBadges[part] = selectedTasks.filter(t => t.part === part).length;
  });
  return initialBadges;
};

// Create Context
const ServiceContext = createContext();

const FilterSection = ({ filter, onFilterChange }) => {
  return (
    <div className={'filter-section'}>
      {getTaskTypes().map(type => (
        <button
          key={type}
          className={`filter-btn ${filter === type ? 'active' : ''}`}
          onClick={() => onFilterChange(type)}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)} Tasks
        </button>
      ))}
    </div>
  );
};

const Category = ({ part, filter, selectedTasks, onTaskClick, onRemoveTask, categoryBadges }) => (
  <div className="category-box">
    <div className="category-header">
      <div className="image-placeholder">
        <img src={`./images/${part}.png`} alt={`${part} Image Placeholder`} />
      </div>
      <div className="category-title">
        <h2>{part.charAt(0).toUpperCase() + part.slice(1)}</h2>
        <span className={`category-badge ${categoryBadges[part] === 0 ? 'category-badge-grey' : ''}`}>
          {categoryBadges[part] || 0}
        </span>
      </div>
    </div>
    <div className="tasks">
      {tasksData[part].map(task => (
        <TaskBox
          key={task.name}
          task={task}
          filter={filter}
          isSelected={selectedTasks.some(t => t.name === task.name)}
          onClick={() => onTaskClick(task)}
          onRemove={() => onRemoveTask(task.name)}
        />
      ))}
    </div>
  </div>
);

const TaskBox = ({ task, filter, isSelected, onClick, onRemove }) => (
  <div
    className={`task-box ${filter === 'all' || filter === task.type ? '' : 'hidden'} ${isSelected ? 'selected' : ''}`}
    onClick={onClick}
  >
    <div className="task-image-placeholder">
      <img src="./images/task.png" alt="Task Image Placeholder" />
    </div>
    <span>{task.name}</span>
    <div className="price-tooltip">${task.price} per {task.unit}</div>
    {isSelected && (
      <button
        className="task-remove"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
);

const TableView = ({ selectedTasks, onQuantityChange, onRemoveTask, calculateTotal, vehicleNumber }) => (
  <div className="table-view-wrapper">
    <div className="table-view-info">Vehicle No: {vehicleNumber || 'Not specified'}</div>
    <table className="tasks-table">
      <thead>
        <tr>
          <th>Task Name</th>
          <th>Quantity</th>
          <th>Unit</th>
          <th>Subtotal</th>
          <th>Notes</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {selectedTasks.map((task, index) => (
          <tr key={task.name + index}>
            <td>{task.name}</td>
            <td>
              <input
                type="number"
                min="1"
                value={task.quantity}
                onChange={(e) => onQuantityChange(task.name, e.target.value)}
                className="quantity-input"
              />
            </td>
            <td>{task.unit.charAt(0).toUpperCase() + task.unit.slice(1)}</td>
            <td>${(task.price * task.quantity).toFixed(2)}</td>
            <td>{task.remarks || '-'}</td>
            <td>
              <button className="remove-btn" onClick={() => onRemoveTask(task.name)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan="3">Total:</td>
          <td colSpan="3">${calculateTotal}</td>
        </tr>
      </tfoot>
    </table>
  </div>
);

const Sidebar = ({ vehicleNumber, selectedTasks, onVehicleChange, onRemoveTask, onQuantityChange, onRemarksChange, calculateTotal }) => (
  <div className="sidebar">
    <div className="sidebar-header">
      <div className="vehicle-input">
        <label htmlFor="vehicle-number">Vehicle No:</label>
        <input
          type="text"
          id="vehicle-number"
          placeholder="Enter vehicle number"
          value={vehicleNumber}
          onChange={(e) => onVehicleChange(e.target.value)}
          className="quantity-input"
        />
      </div>
      <div className="header-row">
        <h3>Selected Tasks</h3>
        <div className="top-total">
          <span>Total: </span>
          <span className="top-total-amount">${calculateTotal}</span>
        </div>
      </div>
    </div>
    <div className="task-list">
      {selectedTasks.map((task, index) => (
        <SelectedTaskItem
          key={task.name + index}
          task={task}
          onQuantityChange={(newQuantity) => onQuantityChange(task.name, newQuantity)}
          onRemarksChange={(newRemarks) => onRemarksChange(task.name, newRemarks)}
          onRemove={() => onRemoveTask(task.name)}
        />
      ))}
    </div>
  </div>
);

const SelectedTaskItem = ({ task, onQuantityChange, onRemarksChange, onRemove }) => (
  <div className="selected-task-item">
    <div className="task-header">
      <span>{task.name}</span>
      <div className="job-input">
        <label>{task.unit.charAt(0).toUpperCase() + task.unit.slice(1)}</label>
        <input
          type="number"
          min="1"
          value={task.quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
          className="quantity-input"
        />
      </div>
      <button className="remove-btn" onClick={onRemove}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div className="subtotal">Subtotal: ${(task.price * task.quantity).toFixed(2)}</div>
    <div className="task-remarks">
      <textarea
        placeholder="Add notes for this task..."
        value={task.remarks}
        onChange={(e) => onRemarksChange(e.target.value)}
      />
    </div>
  </div>
);

const ServiceEntry = ({ onSave, onBack }) => {
    const { filter, selectedTasks, vehicleNumber, categoryBadges, setFilter, setSelectedTasks, setActiveView, handleTaskClick, handleRemoveTask, calculateTotal, setVehicleNumber } = useContext(ServiceContext);

  const handleQuantityChange = (taskName, newQuantity) => {
    const quantity = parseInt(newQuantity) || 1;
    setSelectedTasks(selectedTasks.map(task =>
      task.name === taskName ? { ...task, quantity } : task
    ));
  };

  const handleRemarksChange = (taskName, newRemarks) => {
    setSelectedTasks(selectedTasks.map(task =>
      task.name === taskName ? { ...task, remarks: newRemarks } : task
    ));
  };

  const handleSave = () => {
    onSave({ vehicleNumber, selectedTasks });
    onBack();
  };

  return (
    <div className="app-container">
      <div className="service-entry-header">
        <div className="service-entry-filter">
          <FilterSection filter={filter} onFilterChange={setFilter} />
        </div>
        <div className="service-entry-actions">
          <button className="button-primary" onClick={() => setActiveView('dashboard')}>
            Parts Hub
          </button>
          <button className="button-secondary" onClick={handleSave}>
            Save & Back
          </button>
        </div>
      </div>
      <div className="main-content">
        <div className="categories">
          {Object.entries(tasksData).map(([part, tasks]) => (
            <Category
              key={part}
              part={part}
              filter={filter}
              selectedTasks={selectedTasks}
              onTaskClick={handleTaskClick}
              onRemoveTask={handleRemoveTask}
              categoryBadges={categoryBadges}
            />
          ))}
        </div>
        <Sidebar
          vehicleNumber={vehicleNumber}
          selectedTasks={selectedTasks}
          onVehicleChange={setVehicleNumber}
          onRemoveTask={handleRemoveTask}
          onQuantityChange={handleQuantityChange}
          onRemarksChange={handleRemarksChange}
          calculateTotal={calculateTotal()}
        />
      </div>
    </div>
  );
};

const PartsHub = ({ onBack }) => {
  const { selectedTasks, vehicleNumber, setSelectedTasks, setActiveView, handleQuantityChange, handleRemoveTask, calculateTotal } = useContext(ServiceContext);

  return (
    <div className="app-container">
      <div className="service-entry-header">
        <div className="service-entry-actions">
          <button className="button-primary" onClick={() => setActiveView('entry')}>
            Tasks Dashboard
          </button>
          <button className="button-secondary" onClick={onBack}>
            Save & Back
          </button>
        </div>
      </div>
      <div className="table-view-wrapper">
        <TableView
          selectedTasks={selectedTasks}
          onQuantityChange={handleQuantityChange}
          onRemoveTask={handleRemoveTask}
          calculateTotal={calculateTotal()}
          vehicleNumber={vehicleNumber}
        />
      </div>
    </div>
  );
};

const ServiceHub = ({ service, onSave, onBack }) => {
  const initialState = {
    selectedTasks: service.selectedTasks || [],
    vehicleNumber: service.vehicleNumber || '',
    filter: 'all',
    categoryBadges: initializeCategoryBadges(tasksData, service.selectedTasks || []),
    activeView: 'entry',
  };
      
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
        case 'SET_SELECTED_TASKS':
        return { ...state, selectedTasks: action.payload };
        case 'SET_VEHICLE_NUMBER':
        return { ...state, vehicleNumber: action.payload };
        case 'SET_FILTER':
        return { ...state, filter: action.payload };
        case 'SET_CATEGORY_BADGES':
        return { ...state, categoryBadges: action.payload };
        case 'SET_ACTIVE_VIEW':
        return { ...state, activeView: action.payload };
        default:
        return state;
    }
  }, initialState);
      
  const { selectedTasks, vehicleNumber, filter, categoryBadges, activeView } = state;

  useEffect(() => {
    dispatch({ type: 'SET_CATEGORY_BADGES', payload: initializeCategoryBadges(tasksData, selectedTasks) });
  }, [selectedTasks]);

  const setSelectedTasks = (tasks) => dispatch({ type: 'SET_SELECTED_TASKS', payload: tasks });
  const setVehicleNumber = (number) => dispatch({ type: 'SET_VEHICLE_NUMBER', payload: number });
  const setFilter = (newFilter) => dispatch({ type: 'SET_FILTER', payload: newFilter });
  const setActiveView = (view) => dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
  const handleTaskClick = (task) => {
    if (!selectedTasks.some(t => t.name === task.name)) {
      setSelectedTasks([...selectedTasks, { ...task, quantity: 1, remarks: '' }]);
      updateCategoryBadges(task.part, 1);
    }
  };
  const handleRemoveTask = (taskName) => {
    setSelectedTasks(selectedTasks.filter(task => task.name !== taskName));
    updateCategoryBadges(getTaskPart(taskName), -1);
  };
  const handleQuantityChange = (taskName, newQuantity) => {
    const quantity = parseInt(newQuantity) || 1;
    setSelectedTasks(selectedTasks.map(task =>
      task.name === taskName ? { ...task, quantity } : task
    ));
  };
  const handleRemarksChange = (taskName, newRemarks) => {
    setSelectedTasks(selectedTasks.map(task =>
      task.name === taskName ? { ...task, remarks: newRemarks } : task
    ));
  };
  const updateCategoryBadges = (part, change) => {
    dispatch({ type: 'SET_CATEGORY_BADGES', payload: {
      ...categoryBadges,
      [part]: Math.max(0, (categoryBadges[part] || 0) + change),
    } });
  };
  const getTaskPart = (taskName) => {
    for (const part in tasksData) {
      if (tasksData[part].some(task => task.name === taskName)) return part;
    }
    return null;
  };
  const calculateTotal = () => selectedTasks.reduce((sum, task) => sum + task.price * task.quantity, 0).toFixed(2);

  const contextValue = {
    selectedTasks, vehicleNumber, filter, categoryBadges,
    setSelectedTasks, setVehicleNumber, setFilter, setActiveView, handleTaskClick,
    handleRemoveTask, handleQuantityChange, handleRemarksChange, calculateTotal,
  };

  return (
    <ServiceContext.Provider value={contextValue}>
      {activeView === 'entry' ? (
        <ServiceEntry onSave={() => onSave({ ...service, vehicleNumber, selectedTasks })} onBack={onBack} />
      ) : (
        <PartsHub onBack={onBack} />
      )}
    </ServiceContext.Provider>
  );
};

const ServiceList = ({ services, onEdit, onAdd }) => (
  <div className="app-container">
    <button className="service-list-add-button" onClick={onAdd}>
      Add New Service
    </button>
    <h2 className="service-list-title">Service List</h2>
    <table className="tasks-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Vehicle No</th>
          <th>Tasks</th>
          <th>Total</th>
          <th>Created Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {services.map(service => (
          <tr key={service.id}>
            <td>{service.id}</td>
            <td>{service.vehicleNumber || 'Not specified'}</td>
            <td>{service.selectedTasks.length}</td>
            <td>${service.selectedTasks.reduce((sum, task) => sum + task.price * task.quantity, 0).toFixed(2)}</td>
            <td>{new Date(service.createdDate).toLocaleDateString()}</td>
            <td>
              <button className="service-list-edit-button" onClick={() => onEdit(service.id)}>
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const App = () => {
  const [services, setServices] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [currentServiceId, setCurrentServiceId] = useState(null);

  const handleAddService = () => {
    const newService = {
      id: Date.now(),
      vehicleNumber: '',
      selectedTasks: [],
      createdDate: new Date().toISOString(),
    };
    setServices([...services, newService]);
    setCurrentServiceId(newService.id);
    setViewMode('entry');
  };

  const handleEditService = (id) => {
    setCurrentServiceId(id);
    setViewMode('entry');
  };

  const handleSaveService = (updatedService) => {
    setServices(services.map(s => (s.id === updatedService.id ? updatedService : s)));
    setViewMode('list');
    setCurrentServiceId(null);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentServiceId(null);
  };

  const currentService = services.find(s => s.id === currentServiceId) || {};

  return (
    <>
      {viewMode === 'list' ? (
        <ServiceList services={services} onEdit={handleEditService} onAdd={handleAddService} />
      ) : (
        <ServiceHub service={currentService} onSave={handleSaveService} onBack={handleBackToList} />
      )}
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);