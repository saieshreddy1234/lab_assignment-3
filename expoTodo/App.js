import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const animationValue = new Animated.Value(0);

  // Load tasks from AsyncStorage on app start
  useEffect(() => {
    const loadTasksFromStorage = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };
    loadTasksFromStorage();
  }, []);

  // Save tasks to AsyncStorage whenever tasks change
  useEffect(() => {
    const saveTasksToStorage = async (tasks) => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Error saving tasks:', error);
      }
    };
    saveTasksToStorage(tasks);
  }, [tasks]);

  const addOrUpdateTask = () => {
    if (task.trim()) { // Check if the input is not empty
      if (editingTaskId) {
        // Update existing task
        setTasks(tasks.map(item =>
          item.id === editingTaskId ? { ...item, text: task } : item
        ));
        setEditingTaskId(null); // Reset editing state
      } else {
        // Add a new task
        setTasks([...tasks, { id: Date.now().toString(), text: task, completed: false }]);
        animateTaskAddition(); // Optional animation
      }
      setTask(''); // Clear the input field
    }
  };
  

  // Toggle task completion
  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Start editing a task
  const startEditingTask = (task) => {
    setTask(task.text);
    setEditingTaskId(task.id);
  };

  // Animate task addition
  const animateTaskAddition = () => {
    animationValue.setValue(0);
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Delete a task
  const deleteTask = (taskId) => {
    setTasks(tasks.filter((item) => item.id !== taskId));
  };

  // Main return for the functional component
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Extended To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add or edit a task"
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addOrUpdateTask}>
          <Text style={styles.addButtonText}>{editingTaskId ? '✓' : '+'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <Animated.View
            style={{
              opacity: animationValue,
              transform: [{ scale: animationValue }],
            }}
          >
            <View style={styles.taskContainer}>
              <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
                <Text style={styles.taskText(item.completed)}>{item.text}</Text>
              </TouchableOpacity>
              <View style={styles.taskActions}>
                <TouchableOpacity onPress={() => startEditingTask(item)}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTask(item.id)}>
                  <Text style={styles.deleteButton}>X</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  taskText: (completed) => ({
    fontSize: 16,
    color: completed ? '#888' : '#333',
    textDecorationLine: completed ? 'line-through' : 'none',
  }),
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    color: '#007BFF',
    marginRight: 10,
  },
  deleteButton: {
    color: '#FF5C5C',
    fontWeight: 'bold',
  },
});
