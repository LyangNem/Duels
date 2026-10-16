


/* 시작 */
const AuthResolutionUI={
  pending:true,
  setPending(pending=true){
    const nextPending=
      pending===true;

    this.pending=
      nextPending;

    document.documentElement.classList.toggle(
      'duels3-auth-pending',
      nextPending
    );

    document.getElementById('duels3-auth-loading')
      ?.classList.toggle(
        'hidden',
        !nextPending
      );

    document.querySelectorAll('button').forEach(button=>{
      if(nextPending){
        if(!button.hasAttribute('data-auth-lock-was-disabled')){
          button.setAttribute(
            'data-auth-lock-was-disabled',
            button.disabled?'1':'0'
          );
        }
        button.disabled=true;
        button.setAttribute('aria-busy','true');
      }else{
        const previous=
          button.getAttribute(
            'data-auth-lock-was-disabled'
          );

        if(previous!==null){
          button.disabled=
            previous==='1';

          button.removeAttribute(
            'data-auth-lock-was-disabled'
          );
        }

        button.removeAttribute(
          'aria-busy'
        );
      }
    });

    return nextPending;
  },
  resolve(){
    return this.setPending(false);
  }
};