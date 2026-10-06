

/* 레코드 변경 실시간 UI 구독 */
GameEvents.on(
  'character-record-changed',
  payload=>
    CharacterRecordLiveRefreshService
      .refresh(payload)
);