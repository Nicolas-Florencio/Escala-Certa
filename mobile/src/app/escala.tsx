import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type DiaCalendario = {
  dia: string;
  foraDoMes?: boolean;
  evento?: string;
  tipo?: 'plantao' | 'folga';
};

const dias: DiaCalendario[] = [
  { dia: '30', foraDoMes: true },
  { dia: '31', foraDoMes: true },
  { dia: '1' },
  { dia: '2' },
  { dia: '3' },
  { dia: '4' },
  { dia: '5' },

  { dia: '6', evento: 'Plantão', tipo: 'plantao' },
  { dia: '7', evento: 'Plantão', tipo: 'plantao' },
  { dia: '8' },
  { dia: '9' },
  { dia: '10' },
  { dia: '11', evento: 'Folga', tipo: 'folga' },
  { dia: '12', evento: 'Folga', tipo: 'folga' },

  { dia: '13', evento: 'Plantão', tipo: 'plantao' },
  { dia: '14' },
  { dia: '15' },
  { dia: '16' },
  { dia: '17', evento: 'Folga', tipo: 'folga' },
  { dia: '18' },
  { dia: '19' },

  { dia: '20', evento: 'Plantão', tipo: 'plantao' },
  { dia: '21' },
  { dia: '22' },
  { dia: '23' },
  { dia: '24' },
  { dia: '25' },
  { dia: '26', evento: 'Folga', tipo: 'folga' },

  { dia: '27', evento: 'Plantão', tipo: 'plantao' },
  { dia: '28' },
  { dia: '29' },
  { dia: '30' },
  { dia: '1', foraDoMes: true },
  { dia: '2', foraDoMes: true },
  { dia: '3', foraDoMes: true },
];

const semana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function Escala() {
  // Estado responsável pelo menu lateral
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Pressable onPress={() => setMenuAberto(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>

        <Text style={styles.title}>Minha escala</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.month}>Setembro 2026</Text>

        {/* Dias da semana */}
        <View style={styles.weekRow}>
          {semana.map((dia, index) => (
            <View style={styles.weekCell} key={index}>
              <Text style={styles.weekText}>{dia}</Text>
            </View>
          ))}
        </View>

        {/* Calendário */}
        <View style={styles.calendar}>
          {dias.map((item, index) => (
            <View
              key={index}
              style={[
                styles.dayCell,
                item.foraDoMes && styles.outsideDay,
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  item.foraDoMes && styles.outsideText,
                ]}
              >
                {item.dia}
              </Text>

              {item.evento && (
                <View
                  style={[
                    styles.event,
                    item.tipo === 'folga'
                      ? styles.folga
                      : styles.plantao,
                  ]}
                >
                  <Text style={styles.eventText}>
                    {item.evento}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Legenda */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.plantao]} />
            <Text>Plantão</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.folga]} />
            <Text>Folga</Text>
          </View>
        </View>
      </ScrollView>

      {/* Menu lateral */}
      {menuAberto && (
        <>
          <Pressable
            style={styles.overlay}
            onPress={() => setMenuAberto(false)}
          />

          <View style={styles.sidebar}>
            <View>
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>
                  Gestão de Plantões
                </Text>

                <Pressable onPress={() => setMenuAberto(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.menuGroup}>
                <MenuItem
                  texto="Dashboard"
                  rota="/dashboard"
                />

                <MenuItem
                  texto="Minha escala"
                  rota="/escala"
                />

                <MenuItem
                  texto="Solicitar troca"
                  rota="/trocas"
                />

                <MenuItem
                  texto="Solicitar folga"
                  rota="/folgas"
                />
              </View>
            </View>

            <Pressable onPress={() => router.replace('/')}>
              <Text style={styles.menuItem}>Sair</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

// Componente reutilizável para as opções do menu
function MenuItem({
  texto,
  rota,
}: {
  texto: string;
  rota: '/dashboard' | '/escala' | '/folgas' | '/trocas';
}) {
  return (
    <Pressable onPress={() => router.push(rota)}>
      <Text style={styles.menuItem}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  header: {
    height: 90,
    paddingTop: 38,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    gap: 18,
  },

  menuIcon: {
    fontSize: 28,
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
  },

  content: {
    padding: 16,
  },

  month: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 18,
  },

  weekRow: {
    flexDirection: 'row',
    backgroundColor: '#777777',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },

  weekCell: {
    width: '14.2857%',
    alignItems: 'center',
    paddingVertical: 10,
  },

  weekText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
  },

  dayCell: {
    width: '14.2857%',
    minHeight: 72,
    borderWidth: 0.4,
    borderColor: '#CCCCCC',
    padding: 5,
  },

  outsideDay: {
    backgroundColor: '#EEEEEE',
  },

  dayNumber: {
    fontSize: 13,
    fontWeight: '500',
  },

  outsideText: {
    color: '#AAAAAA',
  },

  event: {
    marginTop: 7,
    paddingVertical: 4,
    paddingHorizontal: 3,
    borderRadius: 4,
  },

  plantao: {
    backgroundColor: '#18B663',
  },

  folga: {
    backgroundColor: '#3B82F6',
  },

  eventText: {
    fontSize: 9,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  legend: {
    flexDirection: 'row',
    gap: 22,
    marginTop: 20,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 1,
  },

  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '78%',
    maxWidth: 310,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 30,
    justifyContent: 'space-between',
    zIndex: 2,
  },

  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  sidebarTitle: {
    fontSize: 20,
    fontWeight: '600',
  },

  closeButton: {
    fontSize: 22,
  },

  menuGroup: {
    marginTop: 45,
  },

  menuItem: {
    fontSize: 16,
    marginBottom: 26,
  },
});