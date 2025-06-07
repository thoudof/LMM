import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Button, TextInput, IconButton, Text } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import { FilterOptions, Client, TripStatus } from '../types';
import { useDatabase } from '../context/DatabaseContext';

interface FilterBarProps {
  onFilter: (options: FilterOptions) => void;
  onClear: () => void;
}

const statusOptions = [
  { label: 'Все статусы', value: '' },
  { label: 'Запланирован', value: 'planned' },
  { label: 'В пути', value: 'in-progress' },
  { label: 'Завершен', value: 'completed' },
  { label: 'Отменен', value: 'cancelled' },
];

const FilterBar: React.FC<FilterBarProps> = ({ onFilter, onClear }) => {
  const { clients } = useDatabase();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  
  // Dropdown state
  const [openClientDropdown, setOpenClientDropdown] = useState(false);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);
  
  const handleChange = (field: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };
  
  const handleFilter = () => {
    onFilter(filters);
  };
  
  const handleClear = () => {
    setFilters({});
    onClear();
  };
  
  // Prepare client options for dropdown
  const clientOptions = [
    { label: 'Все клиенты', value: '' },
    ...clients.map(client => ({
      label: client.name,
      value: client.id || '',
    })),
  ];
  
  if (!isExpanded) {
    return (
      <View style={styles.collapsedContainer}>
        <Button 
          mode="outlined" 
          icon="filter" 
          onPress={() => setIsExpanded(true)}
        >
          Фильтры
        </Button>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium">Фильтры</Text>
        <IconButton
          icon="close"
          size={20}
          onPress={() => setIsExpanded(false)}
        />
      </View>
      
      <ScrollView style={styles.filtersContainer}>
        <View style={styles.dateContainer}>
          <TextInput
            label="С даты"
            value={filters.startDate || ''}
            onChangeText={(value) => handleChange('startDate', value)}
            style={styles.dateInput}
            placeholder="ГГГГ-ММ-ДД"
          />
          
          <TextInput
            label="По дату"
            value={filters.endDate || ''}
            onChangeText={(value) => handleChange('endDate', value)}
            style={styles.dateInput}
            placeholder="ГГГГ-ММ-ДД"
          />
        </View>
        
        <Text style={styles.dropdownLabel}>Клиент</Text>
        <View style={styles.dropdownContainer}>
          <DropDownPicker
            open={openClientDropdown}
            value={filters.clientId || ''}
            items={clientOptions}
            setOpen={setOpenClientDropdown}
            setValue={(callback) => {
              if (typeof callback === 'function') {
                const newValue = callback(filters.clientId || '');
                handleChange('clientId', newValue);
              } else {
                handleChange('clientId', callback);
              }
            }}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownList}
            placeholder="Выберите клиента"
            listMode="SCROLLVIEW"
          />
        </View>
        
        <TextInput
          label="Пункт отправления"
          value={filters.startLocation || ''}
          onChangeText={(value) => handleChange('startLocation', value)}
          style={styles.input}
        />
        
        <TextInput
          label="Пункт назначения"
          value={filters.endLocation || ''}
          onChangeText={(value) => handleChange('endLocation', value)}
          style={styles.input}
        />
        
        <Text style={styles.dropdownLabel}>Статус</Text>
        <View style={styles.dropdownContainer}>
          <DropDownPicker
            open={openStatusDropdown}
            value={filters.status || ''}
            items={statusOptions}
            setOpen={setOpenStatusDropdown}
            setValue={(callback) => {
              if (typeof callback === 'function') {
                const newValue = callback(filters.status || '');
                handleChange('status', newValue as TripStatus);
              } else {
                handleChange('status', callback as TripStatus);
              }
            }}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownList}
            placeholder="Выберите статус"
            listMode="SCROLLVIEW"
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            mode="outlined" 
            onPress={handleClear} 
            style={styles.button}
          >
            Сбросить
          </Button>
          <Button 
            mode="contained" 
            onPress={handleFilter} 
            style={styles.button}
          >
            Применить
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  collapsedContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  filtersContainer: {
    padding: 16,
    paddingTop: 0,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    width: '48%',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 12,
    marginBottom: 4,
    color: '#666',
  },
  dropdownContainer: {
    marginBottom: 16,
    zIndex: 1000,
  },
  dropdown: {
    borderColor: '#ccc',
    borderRadius: 4,
  },
  dropdownList: {
    borderColor: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
    zIndex: -1,
  },
  button: {
    width: '48%',
  },
});

export default FilterBar;