// Use global React and ReactDOM exposed from index.html
const { useState, useTransition } = window.React;
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

const FilterSection = ({ filter, onFilterChange, isPending }) => (
  <div className="filter-section" style={{ opacity: isPending ? 0.5 : 1 }}>
    {isPending && <span style={{ marginRight: '10px' }}>Loading...</span>}
    {getTaskTypes().map(type => (
      <button
        key={type}
        className={`filter-btn ${filter === type ? 'active' : ''}`}
        onClick={() => onFilterChange(type)}
        disabled={isPending}
      >
        {type.charAt(0).toUpperCase() + type.slice(1)} Tasks
      </button>
    ))}
  </div>
);

const Category = ({ part, filter, selectedTasks, onTaskClick, onRemoveTask, categoryBadges, isTableView }) => (
  !isTableView && (
    <div className="category-box" data-part={part}>
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
  )
);

const TaskBox = ({ task, filter, isSelected, onClick, onRemove, isTableView }) => (
  !isTableView && (
    <div
      className={`task-box ${filter === 'all' || filter === task.type ? '' : 'hidden'} ${isSelected ? 'selected' : ''}`}
      data-type={task.type}
      data-price={task.price}
      data-unit={task.unit}
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
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
);

const TableView = ({ selectedTasks, onQuantityChange, onRemoveTask, calculateTotal, vehicleNumber }) => (
  <div className="table-view">
    <div style={{ marginBottom: '10px' }}>Vehicle No: {vehicleNumber || 'Not specified'}</div>
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
                style={{ width: '50px', padding: '5px' }}
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

const Sidebar = ({ vehicleNumber, selectedTasks, onVehicleChange, onRemoveTask, onQuantityChange, onRemarksChange, calculateTotal, isTableView }) => (
  !isTableView && (
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
  )
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

const ServiceEntry = ({ service, onSave, onBack }) => {
    const [selectedTasks, setSelectedTasks] = useState(service.selectedTasks || []);
    const [filter, setFilter] = useState('all');
    const [vehicleNumber, setVehicleNumber] = useState(service.vehicleNumber || '');
    const [categoryBadges, setCategoryBadges] = useState({
      engine: selectedTasks.filter(t => t.part === 'engine').length,
      fuel: selectedTasks.filter(t => t.part === 'fuel').length,
      refill: selectedTasks.filter(t => t.part === 'refill').length,
    });
    const [isTableView, setIsTableView] = useState(false);
    const [isPending, startTransition] = useTransition();
  
    const handleFilter = (newFilter) => startTransition(() => setFilter(newFilter));
  
    const handleTaskClick = (task) => {
      if (!selectedTasks.some(t => t.name === task.name)) {
        setSelectedTasks([...selectedTasks, { ...task, quantity: 1, remarks: '' }]);
        updateCategoryBadges(task.part, 1);
      }
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
  
    const handleRemoveTask = (taskName) => {
      setSelectedTasks(selectedTasks.filter(task => task.name !== taskName));
      updateCategoryBadges(getTaskPart(taskName), -1);
    };
  
    const updateCategoryBadges = (part, change) => {
      setCategoryBadges(prev => ({
        ...prev,
        [part]: Math.max(0, prev[part] + change),
      }));
    };
  
    const getTaskPart = (taskName) => {
      for (const part in tasksData) {
        if (tasksData[part].some(task => task.name === taskName)) return part;
      }
      return null;
    };
  
    const calculateTotal = () => {
      return selectedTasks.reduce((sum, task) => sum + task.price * task.quantity, 0).toFixed(2);
    };
  
    const toggleTableView = () => setIsTableView(!isTableView);
  
    const handleSave = () => {
      onSave({ ...service, vehicleNumber, selectedTasks });
      onBack();
    };
  
    return (
      <div className="app-container">
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px' }}>
          {!isTableView && (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
              <FilterSection filter={filter} onFilterChange={handleFilter} isPending={isPending} />
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={toggleTableView}
              style={{
                padding: '8px 16px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {isTableView ? 'Back to List' : 'View as Table'}
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '8px 16px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Save & Back
            </button>
          </div>
        </div>
        {isTableView ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <TableView
              selectedTasks={selectedTasks}
              onQuantityChange={handleQuantityChange}
              onRemoveTask={handleRemoveTask}
              calculateTotal={calculateTotal()}
              vehicleNumber={vehicleNumber}
            />
          </div>
        ) : (
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
                  isTableView={isTableView}
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
              calculateTotal={calculateTotal}
              isTableView={isTableView}
            />
          </div>
        )}
      </div>
    );
};

const ServiceList = ({ services, onEdit, onAdd }) => (
  <div className="app-container">
    <button
      onClick={onAdd}
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        padding: '8px 16px',
        background: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
      }}
    >
      Add New Service
    </button>
    <h2 style={{ textAlign: 'center', margin: '20px 0' }}>Service List</h2>
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
              <button
                onClick={() => onEdit(service.id)}
                style={{
                  padding: '5px 10px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
              >
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
        <ServiceList
          services={services}
          onEdit={handleEditService}
          onAdd={handleAddService}
        />
      ) : (
        <ServiceEntry
          service={currentService}
          onSave={handleSaveService}
          onBack={handleBackToList}
        />
      )}
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);