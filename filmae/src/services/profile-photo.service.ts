import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { ActionSheetIOS, Alert, type AlertButton, Linking, Platform } from 'react-native';

type PhotoSource = 'camera' | 'library';

type PickPhotoResult = { status: 'cancelled' } | { status: 'denied' } | { status: 'saved' };

const listeners = new Set<() => void>();
let photoVersion = 0;

function photoFile(userId: number) {
  return new File(Paths.document, `profile-photo-${userId}.jpg`);
}

function notifyChange() {
  photoVersion += 1;
  listeners.forEach((listener) => listener());
}

export function subscribeProfilePhoto(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

// O `?v=` muda a cada alteração para a imagem não ficar em cache com a foto antiga.
export function getProfilePhotoUri(userId: number): string | null {
  const file = photoFile(userId);

  return file.exists ? `${file.uri}?v=${photoVersion}` : null;
}

export function removeProfilePhoto(userId: number) {
  const file = photoFile(userId);

  if (file.exists) {
    file.delete();
  }

  notifyChange();
}

async function pickProfilePhoto(userId: number, source: PhotoSource): Promise<PickPhotoResult> {
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      return { status: 'denied' };
    }
  }

  const options: ImagePicker.ImagePickerOptions = {
    allowsEditing: true,
    aspect: [1, 1],
    mediaTypes: ['images'],
    quality: 0.7,
  };

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

  const asset = result.canceled ? undefined : result.assets[0];

  if (!asset) {
    return { status: 'cancelled' };
  }

  await new File(asset.uri).copy(photoFile(userId), { overwrite: true });
  notifyChange();

  return { status: 'saved' };
}

async function choosePhoto(userId: number, source: PhotoSource) {
  try {
    const result = await pickProfilePhoto(userId, source);

    if (result.status === 'denied') {
      Alert.alert(
        'Permissão necessária',
        'Libere o acesso à câmera nas configurações do aparelho para tirar a sua foto.',
        [
          { style: 'cancel', text: 'Agora não' },
          { onPress: () => void Linking.openSettings(), text: 'Abrir configurações' },
        ],
      );
    }
  } catch {
    Alert.alert('Não foi possível salvar a foto', 'Tente novamente em instantes.');
  }
}

export function showProfilePhotoMenu(userId: number) {
  const hasPhoto = getProfilePhotoUri(userId) !== null;

  const actions: { destructive?: boolean; label: string; run: () => void }[] = [
    { label: 'Tirar foto', run: () => void choosePhoto(userId, 'camera') },
    { label: 'Escolher da galeria', run: () => void choosePhoto(userId, 'library') },
  ];

  if (hasPhoto) {
    actions.push({
      destructive: true,
      label: 'Remover foto',
      run: () => removeProfilePhoto(userId),
    });
  }

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        cancelButtonIndex: actions.length,
        destructiveButtonIndex: hasPhoto ? actions.length - 1 : undefined,
        options: [...actions.map((action) => action.label), 'Cancelar'],
        title: 'Foto de perfil',
      },
      (index) => {
        actions[index]?.run();
      },
    );
    return;
  }

  // No Android o Alert aceita até 3 botões; tocar fora da caixa a fecha.
  Alert.alert(
    'Foto de perfil',
    undefined,
    actions.map((action): AlertButton => ({
      onPress: action.run,
      style: action.destructive ? 'destructive' : 'default',
      text: action.label,
    })),
    { cancelable: true },
  );
}
